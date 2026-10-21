-- H.1 Hijri dates (docs/SPEC.md §11a). The Hijri date is Umm al-Qura, shifted so it matches Nigeria's moon sighting.
-- One row per change: "from starts_on, shift by `days`". A date uses the latest row on or before it (0 before the first),
-- so past dates keep the offset that was right for them. `days`, not `offset`: that is an SQL keyword.
create table public.hijri_offsets (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null unique,
  days smallint not null check (days between -2 and 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

alter table public.hijri_offsets enable row level security;

-- Everyone reads it (the public news pages show Hijri dates; nothing sensitive). Only staff write.
create policy read_all on public.hijri_offsets for select to anon, authenticated
  using (true);
create policy staff_insert on public.hijri_offsets for insert to authenticated
  with check (public.is_staff());
create policy staff_update on public.hijri_offsets for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_delete on public.hijri_offsets for delete to authenticated
  using (public.is_staff());

create trigger set_updated before update on public.hijri_offsets
  for each row execute function public.set_updated();

-- Activity log, full mode (create, edit, delete), like the other settings tables.
create trigger audit after insert or update or delete on public.hijri_offsets
  for each row execute function public.audit_row();
