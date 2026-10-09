-- Hifz progress per student for one class: lines of all NEW entries (all time, and inside a date range).
-- Summing in SQL because a class can hold thousands of entries and the API returns at most 1,000 rows.
-- security invoker: row-level security still decides which entries the caller may read.
create function public.hifz_lines_by_student(p_class uuid, p_from date, p_to date)
returns table (student_id uuid, total_lines bigint, period_lines bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    s.id,
    coalesce(sum(e.lines), 0)::bigint,
    coalesce(sum(e.lines) filter (where e.entry_date between p_from and p_to), 0)::bigint
  from public.students s
  left join public.hifz_entries e
    on e.student_id = s.id and e.lesson_type = 'new' and not e.absent
  where s.class_id = p_class and s.status = 'active'
  group by s.id
$$;

revoke execute on function public.hifz_lines_by_student(uuid, date, date) from public, anon;
grant execute on function public.hifz_lines_by_student(uuid, date, date) to authenticated;
