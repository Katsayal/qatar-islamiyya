-- Student portal (5.2): how much of each juz the logged-in student has memorised.
-- done_ayahs = distinct ayahs covered by the student's own new (non-absent) hifz entries,
-- so repeating a range does not count twice. security invoker: RLS only shows the student their own entries.
-- Returns nothing for anyone who is not a student.
create function public.my_juz_progress()
returns table (juz int, total_ayahs bigint, done_ayahs bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    a.juz,
    count(*)::bigint,
    count(*) filter (where exists (
      select 1 from public.hifz_entries e
      where e.student_id = public.my_student_id()
        and e.lesson_type = 'new' and not e.absent
        and (a.surah, a.ayah) between (e.start_surah, e.start_ayah) and (e.end_surah, e.end_ayah)
    ))::bigint
  from public.quran_ayahs a
  where public.my_student_id() is not null
  group by a.juz
  order by a.juz
$$;

revoke execute on function public.my_juz_progress() from public, anon;
grant execute on function public.my_juz_progress() to authenticated;
