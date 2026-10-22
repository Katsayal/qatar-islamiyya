-- P.2: teachers, staff and owners set their own phone number on My account.
-- RLS cannot limit an update to one column, so this function changes only the caller's own phone.
-- null or '' clears it; otherwise a Nigerian number (+234 or 0, then 10 digits).
create function public.set_my_phone(p_phone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v text := nullif(regexp_replace(coalesce(p_phone, ''), '[\s-]', '', 'g'), '');
begin
  if v is not null and v !~ '^(\+234|0)\d{10}$' then
    raise exception 'invalid phone number';
  end if;

  update public.profiles
     set phone = v
   where id = auth.uid()
     and active
     and role in ('teacher', 'staff');
end;
$$;

revoke execute on function public.set_my_phone(text) from public, anon;
grant execute on function public.set_my_phone(text) to authenticated;
