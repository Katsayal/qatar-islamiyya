-- Student bio data, as the school keeps it (see docs/SPEC.md §3):
-- town -> local_government, previous_school -> previous_islamiyya, guardian_town -> guardian_local_government,
-- plus blood_group and an optional student_phone.
-- Columns stay nullable here (older rows exist); "required" is enforced by the forms and the CSV import.

alter table public.students rename column town to local_government;
alter table public.students rename column previous_school to previous_islamiyya;
alter table public.students rename column guardian_town to guardian_local_government;

alter table public.applications rename column town to local_government;
alter table public.applications rename column previous_school to previous_islamiyya;
alter table public.applications rename column guardian_town to guardian_local_government;

alter table public.students
  add column blood_group text check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
  add column student_phone text;

alter table public.applications
  add column blood_group text check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
  add column student_phone text;
