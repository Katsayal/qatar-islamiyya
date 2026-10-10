-- Names of the active teachers of the logged-in student's class.
-- Students cannot read other profiles rows, so this is how the student portal shows "my teachers".
-- Returns nothing for anyone who is not a student.
create function public.my_class_teacher_names()
returns setof text language sql stable security definer set search_path = ''
as $$
  select p.full_name
  from public.students s
  join public.class_teachers ct on ct.class_id = s.class_id
  join public.profiles p on p.id = ct.teacher_id
  where s.id = public.my_student_id() and p.active and p.role = 'teacher'
  order by p.full_name;
$$;

revoke execute on function public.my_class_teacher_names() from public, anon;
grant execute on function public.my_class_teacher_names() to authenticated;
