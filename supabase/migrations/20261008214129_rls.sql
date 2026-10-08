-- RLS policies, field locks and storage buckets. See docs/ARCHITECTURE.md §4–5.
-- Policies that call helper functions are always `to authenticated`
-- (anon has no execute rights on the helpers).

-- ============================================================
-- 1. Helper functions (false for inactive users)
-- ============================================================

create function public.is_staff()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'staff' and active
  );
$$;

create function public.is_owner()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'staff' and is_owner and active
  );
$$;

-- Active teacher or staff.
create function public.is_member()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'staff') and active
  );
$$;

create function public.teaches_class(cid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.class_teachers ct
    join public.profiles p on p.id = ct.teacher_id
    where ct.class_id = cid and ct.teacher_id = auth.uid()
      and p.active and p.role in ('teacher', 'staff')
  );
$$;

create function public.teaches_student(sid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.students s
    join public.class_teachers ct on ct.class_id = s.class_id
    join public.profiles p on p.id = ct.teacher_id
    where s.id = sid and ct.teacher_id = auth.uid()
      and p.active and p.role in ('teacher', 'staff')
  );
$$;

-- Student row of the logged-in student (null for everyone else).
create function public.my_student_id()
returns uuid language sql stable security definer set search_path = ''
as $$
  select s.id from public.students s
  join public.profiles p on p.id = s.user_id
  where s.user_id = auth.uid() and p.active and p.role = 'student';
$$;

-- Only logged-in users may call these.
revoke execute on function
  public.is_staff(), public.is_owner(), public.is_member(),
  public.teaches_class(uuid), public.teaches_student(uuid),
  public.my_student_id(), public.term_for_date(date)
from public, anon;
grant execute on function
  public.is_staff(), public.is_owner(), public.is_member(),
  public.teaches_class(uuid), public.teaches_student(uuid),
  public.my_student_id(), public.term_for_date(date)
to authenticated;

-- Must see the student's real class even when the teacher can't,
-- so RLS (not this trigger) is what rejects the insert.
alter function public.set_hifz_context() security definer;

-- ============================================================
-- 2. Lock context fields on update (values from forms are ignored)
-- ============================================================

create function public.lock_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.student_id := old.student_id;
  if tg_table_name = 'hifz_entries' then
    new.class_id := old.class_id;
    new.teacher_id := old.teacher_id;
    new.term_id := public.term_for_date(new.entry_date);
  elsif tg_table_name = 'attendance' then
    new.recorded_by := old.recorded_by;
    new.term_id := public.term_for_date(new.att_date);
  elsif tg_table_name = 'exam_results' then
    new.book_id := old.book_id;
    new.entered_by := old.entered_by;
  elsif tg_table_name = 'report_comments' then
    new.teacher_id := old.teacher_id;
  end if;
  return new;
end;
$$;

create trigger lock_fields before update on public.hifz_entries
  for each row execute function public.lock_fields();
create trigger lock_fields before update on public.attendance
  for each row execute function public.lock_fields();
create trigger lock_fields before update on public.exam_results
  for each row execute function public.lock_fields();
create trigger lock_fields before update on public.report_comments
  for each row execute function public.lock_fields();

-- ============================================================
-- 3. Staff: full access (profiles, quran_ayahs, school_settings handled below)
-- ============================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'students', 'academic_years', 'terms', 'classes', 'class_teachers',
    'hifz_entries', 'books', 'attendance', 'exam_results', 'report_comments',
    'student_fees', 'payment_proofs', 'posts', 'gallery_items', 'documents',
    'applications', 'contact_messages', 'correction_requests'
  ] loop
    execute format(
      'create policy staff_all on public.%I for all to authenticated
         using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end;
$$;

-- ============================================================
-- 4. Per-table policies
-- ============================================================

-- profiles: own row; staff read all; owner edits anyone;
-- staff edit student profiles only and cannot change their role.
create policy read_profiles on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff());
create policy owner_update on public.profiles for update to authenticated
  using (public.is_owner()) with check (public.is_owner());
create policy staff_update_students on public.profiles for update to authenticated
  using (public.is_staff() and role = 'student')
  with check (public.is_staff() and role = 'student');

-- students
create policy read_students on public.students for select to authenticated
  using (public.teaches_class(class_id) or id = public.my_student_id());

-- Reference tables: any active logged-in user can read.
create policy read_all on public.classes for select to authenticated
  using (public.is_member() or public.my_student_id() is not null);
create policy read_all on public.class_teachers for select to authenticated
  using (public.is_member() or public.my_student_id() is not null);
create policy read_all on public.terms for select to authenticated
  using (public.is_member() or public.my_student_id() is not null);
create policy read_all on public.academic_years for select to authenticated
  using (public.is_member() or public.my_student_id() is not null);
create policy read_all on public.books for select to authenticated
  using (public.is_member() or public.my_student_id() is not null);
create policy read_all on public.quran_ayahs for select to authenticated
  using (public.is_member() or public.my_student_id() is not null);

-- hifz_entries (class_id is set by trigger before this check runs)
create policy read_hifz on public.hifz_entries for select to authenticated
  using (public.teaches_class(class_id) or student_id = public.my_student_id());
create policy teacher_insert on public.hifz_entries for insert to authenticated
  with check (public.teaches_class(class_id));
create policy teacher_update on public.hifz_entries for update to authenticated
  using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));

-- attendance
create policy read_attendance on public.attendance for select to authenticated
  using (public.teaches_student(student_id) or student_id = public.my_student_id());
create policy teacher_insert on public.attendance for insert to authenticated
  with check (public.teaches_student(student_id));
create policy teacher_update on public.attendance for update to authenticated
  using (public.teaches_student(student_id)) with check (public.teaches_student(student_id));

-- exam_results: teacher must teach the student AND be the book's teacher
create policy read_exams on public.exam_results for select to authenticated
  using (public.teaches_student(student_id) or student_id = public.my_student_id());
create policy teacher_insert on public.exam_results for insert to authenticated
  with check (
    public.teaches_student(student_id)
    and exists (select 1 from public.books b where b.id = book_id and b.teacher_id = auth.uid())
  );
create policy teacher_update on public.exam_results for update to authenticated
  using (
    public.teaches_student(student_id)
    and exists (select 1 from public.books b where b.id = book_id and b.teacher_id = auth.uid())
  )
  with check (
    public.teaches_student(student_id)
    and exists (select 1 from public.books b where b.id = book_id and b.teacher_id = auth.uid())
  );

-- report_comments
create policy read_comments on public.report_comments for select to authenticated
  using (public.teaches_student(student_id) or student_id = public.my_student_id());
create policy teacher_insert on public.report_comments for insert to authenticated
  with check (public.teaches_student(student_id));
create policy teacher_update on public.report_comments for update to authenticated
  using (public.teaches_student(student_id)) with check (public.teaches_student(student_id));

-- Student-own tables
create policy read_own on public.student_fees for select to authenticated
  using (student_id = public.my_student_id());

create policy read_own on public.payment_proofs for select to authenticated
  using (student_id = public.my_student_id());
create policy student_insert on public.payment_proofs for insert to authenticated
  with check (student_id = public.my_student_id() and status = 'pending' and verified_by is null);

create policy read_own on public.correction_requests for select to authenticated
  using (student_id = public.my_student_id());
create policy student_insert on public.correction_requests for insert to authenticated
  with check (student_id = public.my_student_id() and status = 'open');

-- posts: published only (drafts = staff via staff_all)
create policy anon_read on public.posts for select to anon
  using (audience = 'public' and published_at <= now());
create policy read_posts on public.posts for select to authenticated
  using (
    published_at <= now() and (
      audience = 'public'
      or (audience = 'internal' and public.is_member())
      or (audience = 'students' and public.my_student_id() is not null)
    )
  );

-- gallery: everyone reads
create policy read_all on public.gallery_items for select to anon, authenticated
  using (true);

-- documents (vault = staff via staff_all)
create policy read_documents on public.documents for select to authenticated
  using (
    (visibility = 'general' and public.is_member())
    or (visibility = 'students' and (public.is_member() or public.my_student_id() is not null))
  );

-- school_settings: bank details are public; only staff edit
create policy read_all on public.school_settings for select to anon, authenticated
  using (true);
create policy staff_update on public.school_settings for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- applications, contact_messages: staff only (public forms insert via server action).

-- ============================================================
-- 5. Storage buckets & policies
-- ============================================================

insert into storage.buckets (id, name, public) values
  ('site', 'site', true),
  ('student-photos', 'student-photos', false),
  ('documents', 'documents', false),
  ('vault', 'vault', false),
  ('private', 'private', false);

-- Staff: full access to every bucket.
create policy staff_all on storage.objects for all to authenticated
  using (
    bucket_id in ('site', 'student-photos', 'documents', 'vault', 'private')
    and public.is_staff()
  )
  with check (
    bucket_id in ('site', 'student-photos', 'documents', 'vault', 'private')
    and public.is_staff()
  );

-- Teachers: photos of students they teach. Students: own photo.
-- (students RLS already limits which rows the subquery sees)
create policy read_student_photos on storage.objects for select to authenticated
  using (
    bucket_id = 'student-photos'
    and exists (
      select 1 from public.students s
      where s.photo_path = objects.name
        and (public.teaches_class(s.class_id) or s.id = public.my_student_id())
    )
  );

-- Documents: readable if the matching documents row is visible to the user.
create policy read_documents on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and exists (select 1 from public.documents d where d.file_path = objects.name)
  );
