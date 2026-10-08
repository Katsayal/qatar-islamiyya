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
  update public.profiles set active = false where id = '00000000-0000-0000-0000-000000000003';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: non-owner staff edited a teacher profile'; end if;
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
