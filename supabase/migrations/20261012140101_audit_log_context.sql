-- L.1 follow-up: edit rows hold only the changed fields, so they could not say WHICH student,
-- class or post they were about. `context` keeps the row's identifying keys (names and ids) for
-- every action, so the activity log page can always name the record.

alter table public.audit_log add column context jsonb;

create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  skip constant text[] := array['updated_at', 'updated_by', 'created_at'];
  ctx_keys constant text[] := array[
    'id', 'name', 'title', 'full_name', 'admission_no', 'caption', 'number', 'month', 'role',
    'att_date', 'entry_date', 'student_id', 'class_id', 'term_id', 'book_id', 'profile_id',
    'teacher_id', 'academic_year_id'
  ];
  v_old jsonb;
  v_new jsonb;
  v_row jsonb;
  v_action text;
begin
  if tg_op = 'INSERT' then
    v_action := 'create';
    v_new := to_jsonb(new);
    v_row := v_new;
  elsif tg_op = 'DELETE' then
    v_action := 'delete';
    v_old := to_jsonb(old);
    v_row := v_old;
  else
    v_action := 'edit';
    select jsonb_object_agg(n.key, o.value), jsonb_object_agg(n.key, n.value)
      into v_old, v_new
      from jsonb_each(to_jsonb(new) - skip) n
      join jsonb_each(to_jsonb(old) - skip) o using (key)
     where n.value is distinct from o.value;
    if v_new is null then
      return null; -- nothing really changed
    end if;
    v_row := to_jsonb(new);
  end if;

  insert into public.audit_log (actor_id, actor_name, action, table_name, row_id, old, new, context)
  values (
    auth.uid(),
    (select full_name from public.profiles where id = auth.uid()),
    v_action,
    tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'class_id', v_row ->> 'profile_id'),
    v_old,
    v_new,
    (select jsonb_object_agg(key, value) from jsonb_each(v_row) where key = any (ctx_keys))
  );
  return null;
end;
$$;

revoke execute on function public.audit_row() from public, anon, authenticated;
