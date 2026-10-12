-- L.1 Activity log (owner only). See docs/SCHEMA.md §8b and ARCHITECTURE §4.
-- Filled by the database itself (AFTER trigger), so no page or action can forget it.
-- Account actions run with the service-role key (no auth.uid()), so they call log_action() instead.

create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid references public.profiles (id) on delete set null, -- null = website / system
  actor_name text,                                                  -- copied at the time, survives renames
  action text not null check (action in ('create', 'edit', 'delete', 'account')),
  table_name text not null,
  row_id text,
  old jsonb,   -- delete: whole row · edit: changed fields only
  new jsonb,   -- create: whole row · edit: changed fields only
  summary text -- account entries only
);
create index on public.audit_log (at desc);
create index on public.audit_log (actor_id, at desc);
create index on public.audit_log (table_name, at desc);

-- One function for every table. Edits keep only the fields that changed and write nothing
-- when nothing changed (e.g. re-saving the same comment).
create function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  skip constant text[] := array['updated_at', 'updated_by', 'created_at'];
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

  insert into public.audit_log (actor_id, actor_name, action, table_name, row_id, old, new)
  values (
    auth.uid(),
    (select full_name from public.profiles where id = auth.uid()),
    v_action,
    tg_table_name,
    coalesce(v_row ->> 'id', v_row ->> 'class_id', v_row ->> 'profile_id'),
    v_old,
    v_new
  );
  return null;
end;
$$;

do $$
declare
  t text;
begin
  -- Full: create, edit, delete.
  foreach t in array array[
    'academic_years', 'terms', 'classes', 'class_teachers', 'students', 'books', 'student_fees',
    'posts', 'gallery_items', 'documents', 'school_settings', 'salary_rates', 'salary_months'
  ] loop
    execute format(
      'create trigger audit after insert or update or delete on public.%I
         for each row execute function public.audit_row()', t);
  end loop;

  -- Edits only: new rows already store who recorded them, or come from students / the public.
  -- profiles: its insert is done by handle_new_user; account creation is logged by log_action().
  foreach t in array array[
    'hifz_entries', 'attendance', 'exam_results', 'report_comments', 'payment_proofs',
    'applications', 'contact_messages', 'correction_requests', 'profiles'
  ] loop
    execute format(
      'create trigger audit after update or delete on public.%I
         for each row execute function public.audit_row()', t);
  end loop;
end;
$$;

-- Explicit entries for account actions (create login/account, reset password).
-- Called with the staff member's own session, so the actor cannot be faked.
create function public.log_action(p_summary text, p_table text, p_row text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'Only staff can write account log entries';
  end if;
  insert into public.audit_log (actor_id, actor_name, action, table_name, row_id, summary)
  values (auth.uid(), (select full_name from public.profiles where id = auth.uid()),
          'account', p_table, p_row, left(p_summary, 300));
end;
$$;

revoke execute on function public.audit_row() from public, anon, authenticated;
revoke execute on function public.log_action(text, text, text) from public, anon;
grant execute on function public.log_action(text, text, text) to authenticated;

-- Read: owner only. Nobody writes through the API (the two functions above write as definer).
alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;
create policy owner_read on public.audit_log for select to authenticated
  using (public.is_owner());
