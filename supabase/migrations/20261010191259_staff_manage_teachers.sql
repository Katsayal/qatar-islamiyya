-- Staff may manage teacher accounts (active, phone, name), like they already do for students.
-- The check keeps role = 'teacher', so staff can never promote a teacher or touch a staff/owner row
-- (only the owner can; see owner_update).
create policy staff_update_teachers on public.profiles for update to authenticated
  using (public.is_staff() and role = 'teacher')
  with check (public.is_staff() and role = 'teacher');
