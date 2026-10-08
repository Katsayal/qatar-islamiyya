-- Supabase Auth's admin createUser inserts the user first and sets app_metadata
-- in a later UPDATE (same transaction). So create the profile on insert OR on the
-- first update that carries a role. Users without a role get no profile (no portal access).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_app_meta_data ->> 'role' is not null then
    insert into public.profiles (id, full_name, role, is_owner)
    values (
      new.id,
      coalesce(new.raw_app_meta_data ->> 'full_name', ''),
      new.raw_app_meta_data ->> 'role',
      coalesce((new.raw_app_meta_data ->> 'is_owner')::boolean, false)
    )
    on conflict (id) do nothing; -- later role changes go through profiles, not metadata
  end if;
  return new;
end;
$$;

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_app_meta_data on auth.users
  for each row execute function public.handle_new_user();
