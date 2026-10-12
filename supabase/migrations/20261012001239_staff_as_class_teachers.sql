-- Some staff members also teach and can be assigned to a class (teaches_class() already accepts staff).
-- The student dashboard's "my teachers" list must show them too: role teacher OR staff.
-- Same signature, so security definer, search_path and the execute grants stay as before.
create or replace function public.my_class_teacher_names()
returns setof text language sql stable security definer set search_path = ''
as $$
  select p.full_name
  from public.students s
  join public.class_teachers ct on ct.class_id = s.class_id
  join public.profiles p on p.id = ct.teacher_id
  where s.id = public.my_student_id() and p.active and p.role in ('teacher', 'staff')
  order by p.full_name;
$$;
