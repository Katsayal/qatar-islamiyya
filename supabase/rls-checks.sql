-- RLS checks. Self-contained: creates fake users/data, tests each role, ROLLS BACK.
-- Run after any policy change:
--   npx supabase db query --linked -f supabase/rls-checks.sql
-- or paste into the Supabase SQL editor. Any failure raises 'FAIL: ...'.

begin;

-- ---------- Fixtures (as postgres, RLS bypassed) ----------
-- 01 owner · 02 staff · 03 teacher A · 04 teacher B · 05 student · 06 inactive teacher
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'rls-owner@test.local',    '{"role":"staff","full_name":"Owner","is_owner":true}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'rls-staff@test.local',    '{"role":"staff","full_name":"Staff"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'rls-teacher-a@test.local','{"role":"teacher","full_name":"Teacher A"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'rls-teacher-b@test.local','{"role":"teacher","full_name":"Teacher B"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'rls-student@test.local',  '{"role":"student","full_name":"Student One"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'rls-inactive@test.local', '{"role":"teacher","full_name":"Inactive"}');
update public.profiles set active = false where id = '00000000-0000-0000-0000-000000000006';

-- Real academic years may exist on DEV; clear them inside this (rolled back) transaction so the test term can cover all dates.
delete from public.student_fees; -- real fee rows would block clearing the terms; all of this is rolled back
delete from public.terms;
delete from public.academic_years;
insert into public.academic_years (id, name, starts_on, ends_on)
  values ('10000000-0000-0000-0000-000000000001', 'RLS-TEST', '1900-01-01', '2999-12-31');
insert into public.terms (academic_year_id, number, starts_on, ends_on)
  values ('10000000-0000-0000-0000-000000000001', 1, '1900-01-01', '2999-12-31');

insert into public.classes (id, name, program, hifz_unit) values
  ('20000000-0000-0000-0000-00000000000a', 'Class A', 'tahfiz', 'lines'),
  ('20000000-0000-0000-0000-00000000000b', 'Class B', 'maahad', 'pages');
insert into public.class_teachers (class_id, teacher_id) values
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000006');

insert into public.students (id, admission_no, full_name, gender, class_id, user_id, photo_path) values
  ('30000000-0000-0000-0000-000000000001', 'RLS1', 'Student One', 'male',   '20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000005', 'students/rls1.jpg'),
  ('30000000-0000-0000-0000-000000000002', 'RLS2', 'Student Two', 'female', '20000000-0000-0000-0000-00000000000b', null, null);

insert into public.books (id, term_number, subject, title, study_type, teacher_id)
  values ('40000000-0000-0000-0000-000000000001', 1, 'test', 'Book of B', 'sharh', '00000000-0000-0000-0000-000000000004');

insert into public.posts (title, audience, published_at) values
  ('pub', 'public', now() - interval '1 day'),
  ('int', 'internal', now() - interval '1 day'),
  ('stu', 'students', now() - interval '1 day'),
  ('draft', 'public', null);

insert into public.student_fees (student_id, term_id, amount_due)
  select '30000000-0000-0000-0000-000000000002', id, 10000 from public.terms where academic_year_id = '10000000-0000-0000-0000-000000000001';

-- ---------- anon ----------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  if (select count(*) from public.students) <> 0 then raise exception 'FAIL: anon can read students'; end if;
  if (select count(*) from public.applications) <> 0 then raise exception 'FAIL: anon can read applications'; end if;
  if (select count(*) from public.posts where title in ('pub','int','stu','draft')) <> 1 then raise exception 'FAIL: anon should see only the published public post'; end if;
  if (select count(*) from public.school_settings) <> 1 then raise exception 'FAIL: anon should read school_settings'; end if;
end $$;
reset role;

-- ---------- teacher A ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
do $$
declare n int;
begin
  if (select count(*) from public.students) <> 1 then raise exception 'FAIL: teacher A should see exactly 1 student'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'FAIL: teacher should see only own profile'; end if;
  if (select count(*) from public.posts where title in ('pub','int','stu','draft')) <> 2 then raise exception 'FAIL: teacher should see public + internal posts'; end if;

  -- own class: allowed; trigger fills class/term/teacher
  insert into public.hifz_entries (student_id, absent) values ('30000000-0000-0000-0000-000000000001', true);

  -- other class: must fail
  begin
    insert into public.hifz_entries (student_id, absent) values ('30000000-0000-0000-0000-000000000002', true);
    raise exception 'FAIL: teacher A recorded hifz for another class';
  exception when insufficient_privilege then null;
  end;

  -- exam for a book taught by someone else: must fail
  begin
    insert into public.exam_results (student_id, book_id, term_id, score)
      values ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
              public.term_for_date(current_date), 80);
    raise exception 'FAIL: teacher A entered marks for a book they do not teach';
  exception when insufficient_privilege then null;
  end;

  -- cannot reassign recorder on update
  update public.hifz_entries set teacher_id = '00000000-0000-0000-0000-000000000004', note = 'edited'
    where student_id = '30000000-0000-0000-0000-000000000001';
  if (select teacher_id from public.hifz_entries where student_id = '30000000-0000-0000-0000-000000000001')
     <> '00000000-0000-0000-0000-000000000003' then raise exception 'FAIL: teacher_id changed on update'; end if;

  -- cannot delete
  delete from public.hifz_entries where student_id = '30000000-0000-0000-0000-000000000001';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: teacher deleted a hifz entry'; end if;

  -- cannot see fees
  if (select count(*) from public.student_fees) <> 0 then raise exception 'FAIL: teacher can see fees'; end if;
  if (select count(*) from public.my_class_teacher_names()) <> 0 then raise exception 'FAIL: teacher got student teacher names'; end if;

  -- a teacher cannot edit any profile, not even a colleague's
  update public.profiles set phone = '0800' where id <> auth.uid();
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: teacher edited another profile'; end if;
end $$;
reset role;

-- ---------- inactive teacher ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000006","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.students) <> 0 then raise exception 'FAIL: inactive teacher can see students'; end if;
  if (select count(*) from public.classes) <> 0 then raise exception 'FAIL: inactive teacher can see classes'; end if;
end $$;
reset role;

-- ---------- student ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000005","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.students) <> 1 then raise exception 'FAIL: student should see only self'; end if;
  if (select id from public.students) <> '30000000-0000-0000-0000-000000000001' then raise exception 'FAIL: student sees wrong row'; end if;
  if (select count(*) from public.hifz_entries) <> 1 then raise exception 'FAIL: student should see own hifz entry'; end if;
  if (select count(*) from public.student_fees) <> 0 then raise exception 'FAIL: student sees another student''s fees'; end if;
  if (select count(*) from public.posts where title in ('pub','int','stu','draft')) <> 2 then raise exception 'FAIL: student should see public + students posts'; end if;
  begin
    insert into public.hifz_entries (student_id, absent) values ('30000000-0000-0000-0000-000000000001', true);
    raise exception 'FAIL: student recorded hifz';
  exception when insufficient_privilege then null;
  end;

  -- my teachers: only the active teachers of own class (Teacher A; not the inactive one, not class B's)
  if (select count(*) from public.my_class_teacher_names()) <> 1
     or (select * from public.my_class_teacher_names()) <> 'Teacher A' then
    raise exception 'FAIL: student should see exactly their class teacher names';
  end if;

  -- correction requests: own only, must start open
  insert into public.correction_requests (student_id, message)
    values ('30000000-0000-0000-0000-000000000001', 'test');
  begin
    insert into public.correction_requests (student_id, message)
      values ('30000000-0000-0000-0000-000000000002', 'for someone else');
    raise exception 'FAIL: student sent a correction for another student';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- ---------- student: juz progress (needs a "new" entry, inserted as the recorder) ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
insert into public.hifz_entries (student_id, entry_date, lesson_type, start_surah, start_ayah, end_surah, end_ayah, start_page, end_page, pages, lines, grade)
  values ('30000000-0000-0000-0000-000000000001', current_date, 'new', 1, 1, 1, 7, 1, 1, 0.47, 7, 'jayyid'),
         ('30000000-0000-0000-0000-000000000001', current_date, 'new', 1, 1, 1, 3, 1, 1, 0.2, 3, 'jayyid'); -- repeat of the same ayahs
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000005","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.my_juz_progress()) <> 30 then raise exception 'FAIL: student should get 30 juz rows'; end if;
  if (select done_ayahs from public.my_juz_progress() where juz = 1) <> 7 then raise exception 'FAIL: juz 1 should have 7 ayahs done (repeat not double counted)'; end if;
  if (select sum(done_ayahs) from public.my_juz_progress()) <> 7 then raise exception 'FAIL: only juz 1 should have progress'; end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.my_juz_progress()) <> 0 then raise exception 'FAIL: teacher got juz progress'; end if;
end $$;
reset role;

-- ---------- student: attendance + exam marks are own-only (rows inserted as the recorder) ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
insert into public.attendance (student_id, att_date, status) values
  ('30000000-0000-0000-0000-000000000001', current_date, 'present'),
  ('30000000-0000-0000-0000-000000000002', current_date, 'absent');
insert into public.exam_results (student_id, book_id, term_id, score) values
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', public.term_for_date(current_date), 80),
  ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', public.term_for_date(current_date), 90);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000005","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.attendance) <> 1 then raise exception 'FAIL: student should see only own attendance'; end if;
  if (select count(*) from public.exam_results) <> 1 or (select score from public.exam_results) <> 80 then raise exception 'FAIL: student should see only own exam marks'; end if;
  if (select count(*) from public.books where id = '40000000-0000-0000-0000-000000000001') <> 1 then raise exception 'FAIL: student should read books'; end if;
  begin
    insert into public.attendance (student_id, att_date, status) values ('30000000-0000-0000-0000-000000000001', current_date - 1, 'present');
    raise exception 'FAIL: student recorded attendance';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- ---------- storage: signature + proof files in the `private` bucket ----------
update public.school_settings set signature_path = 'signature/rls.png' where id = 1;
insert into storage.objects (bucket_id, name) values
  ('private', 'signature/rls.png'),
  ('private', 'proofs/30000000-0000-0000-0000-000000000001/a.jpg'),
  ('private', 'proofs/30000000-0000-0000-0000-000000000002/b.jpg'),
  ('private', 'other/x.jpg');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000005","role":"authenticated"}', true);
do $$
declare n int;
begin
  if (select count(*) from storage.objects where bucket_id = 'private') <> 2 then
    raise exception 'FAIL: student should see only the signature and their own proof file';
  end if;
  insert into storage.objects (bucket_id, name) values ('private', 'proofs/30000000-0000-0000-0000-000000000001/new.jpg');
  begin
    insert into storage.objects (bucket_id, name) values ('private', 'proofs/30000000-0000-0000-0000-000000000002/new.jpg');
    raise exception 'FAIL: student uploaded into another student''s proof folder';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name) values ('private', 'signature/evil.png');
    raise exception 'FAIL: student uploaded outside proofs/';
  exception when insufficient_privilege then null;
  end;
  -- (deleting is blocked for everyone by Supabase's own storage.protect_delete trigger; students have no delete policy either)
  update storage.objects set name = 'proofs/30000000-0000-0000-0000-000000000001/z.jpg'
    where bucket_id = 'private' and name = 'proofs/30000000-0000-0000-0000-000000000001/a.jpg';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: student changed a proof file'; end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from storage.objects where bucket_id = 'private') <> 0 then raise exception 'FAIL: teacher can read the private bucket'; end if;
end $$;
reset role;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  if (select count(*) from storage.objects where bucket_id = 'private') <> 0 then raise exception 'FAIL: anon can read the private bucket'; end if;
end $$;
reset role;

-- ---------- documents: general / students / vault ----------
insert into public.documents (id, title, file_path, visibility) values
  ('50000000-0000-0000-0000-000000000001', 'doc general',  'general.pdf',  'general'),
  ('50000000-0000-0000-0000-000000000002', 'doc students', 'students.pdf', 'students'),
  ('50000000-0000-0000-0000-000000000003', 'doc vault',    'vault.pdf',    'vault');
insert into storage.objects (bucket_id, name) values
  ('documents', 'general.pdf'), ('documents', 'students.pdf'), ('vault', 'vault.pdf');

-- (the checks look only at the fixture rows, so real documents on the DEV project do not matter)
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000005","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.documents where id::text like '50000000-%') <> 1
     or (select visibility from public.documents where id::text like '50000000-%') <> 'students' then
    raise exception 'FAIL: student should see only documents shared with students';
  end if;
  if (select count(*) from storage.objects where bucket_id = 'documents' and name in ('general.pdf', 'students.pdf')) <> 1 then raise exception 'FAIL: student should open only the students file'; end if;
  if (select count(*) from storage.objects where bucket_id = 'vault' and name = 'vault.pdf') <> 0 then raise exception 'FAIL: student can read the vault bucket'; end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.documents where id::text like '50000000-%' and visibility in ('general', 'students')) <> 2 then raise exception 'FAIL: teacher should see general + students documents'; end if;
  if (select count(*) from public.documents where id::text like '50000000-%' and visibility = 'vault') <> 0 then raise exception 'FAIL: teacher can see vault documents'; end if;
  if (select count(*) from storage.objects where bucket_id = 'documents' and name in ('general.pdf', 'students.pdf')) <> 2 then raise exception 'FAIL: teacher should open general + students files'; end if;
  if (select count(*) from storage.objects where bucket_id = 'vault' and name = 'vault.pdf') <> 0 then raise exception 'FAIL: teacher can read the vault bucket'; end if;
end $$;
reset role;

-- ---------- salaries: owner only ----------
-- fixtures as the owner (is_owner() needs a signed-in owner), then every other role must see nothing
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$ begin
  insert into public.salary_rates (profile_id, monthly_amount) values ('00000000-0000-0000-0000-000000000003', 50000);
  insert into public.salary_months (profile_id, month, amount_due, amount_paid, status)
    values ('00000000-0000-0000-0000-000000000003', '2026-10-01', 50000, 20000, 'part');
  if (select count(*) from public.salary_rates) <> 1 or (select count(*) from public.salary_months) <> 1 then
    raise exception 'FAIL: owner should read and write salary records';
  end if;
end $$;
reset role;

-- non-owner staff, teacher A (a rated person herself), the student: nothing visible, nothing writable
do $$
declare uid text; n int;
begin
  foreach uid in array array['00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005'] loop
    perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
    set local role authenticated;
    if (select count(*) from public.salary_rates) <> 0 or (select count(*) from public.salary_months) <> 0 then
      raise exception 'FAIL: % can see salary records', uid;
    end if;
    update public.salary_months set amount_paid = 0;
    get diagnostics n = row_count;
    if n <> 0 then raise exception 'FAIL: % changed a salary record', uid; end if;
    begin
      insert into public.salary_rates (profile_id, monthly_amount) values (uid::uuid, 1);
      raise exception 'FAIL: % created a salary rate', uid;
    exception when insufficient_privilege then null;
    end;
    reset role;
  end loop;
end $$;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  begin
    -- zero rows (RLS) or a privilege error are both fine
    if (select count(*) from public.salary_months) <> 0 then raise exception 'FAIL: anon can read salary records'; end if;
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- ---------- staff (not owner) ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
do $$
declare n int;
begin
  if (select count(*) from public.students where admission_no like 'RLS%') <> 2 then raise exception 'FAIL: staff should see all students'; end if;
  begin
    update public.profiles set role = 'staff' where id = '00000000-0000-0000-0000-000000000005';
    raise exception 'FAIL: staff promoted a student to staff';
  exception when insufficient_privilege then null;
  end;
  -- staff manage teachers: active/phone yes, role never
  update public.profiles set phone = '08011112222' where id = '00000000-0000-0000-0000-000000000003';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: staff could not edit a teacher profile'; end if;
  update public.profiles set active = false where id = '00000000-0000-0000-0000-000000000004';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: staff could not disable a teacher'; end if;
  begin
    update public.profiles set role = 'staff' where id = '00000000-0000-0000-0000-000000000003';
    raise exception 'FAIL: staff promoted a teacher to staff';
  exception when insufficient_privilege then null;
  end;
  -- ...but never another staff member or the owner
  update public.profiles set active = false where id in ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: non-owner staff edited the owner or a staff profile'; end if;
end $$;
reset role;

-- ---------- owner ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
do $$
declare n int;
begin
  update public.profiles set phone = '08000000000' where id = '00000000-0000-0000-0000-000000000003';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: owner could not edit a teacher profile'; end if;
end $$;
reset role;

select 'ALL RLS CHECKS PASSED' as result;
rollback;
