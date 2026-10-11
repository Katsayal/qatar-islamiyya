-- F.1 security review fixes.

-- 1. Students must not read the staff notes or medical notes on their own row (SPEC §10).
-- RLS works per row, so the two columns are hidden with column privileges: everyone gets SELECT
-- on every other column. Staff and teachers read the notes through student_notes() below.
-- A NEW students column must be added to this grant, or nobody can select it.
revoke select on public.students from anon, authenticated;
grant select (
  id, admission_no, full_name, full_name_ar, gender, date_of_birth, photo_path, address, local_government,
  previous_islamiyya, entry_level, guardian_name, guardian_phone, guardian_address, guardian_local_government,
  class_id, status, admitted_on, user_id, created_at, updated_at, updated_by, blood_group, student_phone
) on public.students to anon, authenticated;

-- Notes of the students the caller may see: staff all, teachers their own classes, everyone else nothing.
-- Filter with PostgREST, e.g. rpc('student_notes').eq('id', x).
create function public.student_notes()
returns table (id uuid, notes text, medical_notes text)
language sql stable security definer set search_path = ''
as $$
  select s.id, s.notes, s.medical_notes
  from public.students s
  where public.is_staff() or public.teaches_class(s.class_id);
$$;

revoke execute on function public.student_notes() from public, anon;
grant execute on function public.student_notes() to authenticated;

-- 2. Size and type limits on the buckets, so nobody can skip the app's checks by uploading
-- straight through the Storage API (e.g. a student into their own proofs/ folder).
update storage.buckets
set file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('site', 'student-photos');

update storage.buckets
set file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
where id = 'private';

update storage.buckets set file_size_limit = 5242880 where id in ('documents', 'vault');
