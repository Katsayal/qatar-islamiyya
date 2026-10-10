-- Report cards (4.4): per active student of a class, the numbers for one term.
-- Summing in SQL because a class can hold thousands of entries and the API returns at most 1,000 rows.
-- security invoker: row-level security still decides which rows the caller may read.
create function public.term_report_stats(p_class uuid, p_term uuid)
returns table (
  student_id uuid,
  total_lines bigint,    -- all-time lines of new hifz
  term_lines bigint,     -- lines of new hifz in the term
  present_days bigint,   -- distinct days with a (non-absent) hifz entry in the term
  absent_days bigint,    -- distinct days marked absent in the term
  jayyid bigint,         -- grade counts on new lessons in the term
  jayyid_jiddan bigint,
  mumtaz bigint,
  att_present bigint,    -- Barnamaj attendance in the term
  att_absent bigint,
  att_excused bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    s.id,
    (select coalesce(sum(e.lines), 0) from public.hifz_entries e
      where e.student_id = s.id and e.lesson_type = 'new' and not e.absent)::bigint,
    (select coalesce(sum(e.lines), 0) from public.hifz_entries e
      where e.student_id = s.id and e.term_id = p_term and e.lesson_type = 'new' and not e.absent)::bigint,
    (select count(distinct e.entry_date) from public.hifz_entries e
      where e.student_id = s.id and e.term_id = p_term and not e.absent),
    (select count(distinct e.entry_date) from public.hifz_entries e
      where e.student_id = s.id and e.term_id = p_term and e.absent),
    (select count(*) from public.hifz_entries e
      where e.student_id = s.id and e.term_id = p_term and e.lesson_type = 'new' and e.grade = 'jayyid'),
    (select count(*) from public.hifz_entries e
      where e.student_id = s.id and e.term_id = p_term and e.lesson_type = 'new' and e.grade = 'jayyid_jiddan'),
    (select count(*) from public.hifz_entries e
      where e.student_id = s.id and e.term_id = p_term and e.lesson_type = 'new' and e.grade = 'mumtaz'),
    (select count(*) from public.attendance a where a.student_id = s.id and a.term_id = p_term and a.status = 'present'),
    (select count(*) from public.attendance a where a.student_id = s.id and a.term_id = p_term and a.status = 'absent'),
    (select count(*) from public.attendance a where a.student_id = s.id and a.term_id = p_term and a.status = 'excused')
  from public.students s
  where s.class_id = p_class and s.status = 'active'
$$;

revoke execute on function public.term_report_stats(uuid, uuid) from public, anon;
grant execute on function public.term_report_stats(uuid, uuid) to authenticated;
