-- Salary records (owner only; see docs/SPEC.md §9). Record-keeping, not payroll.
-- Kept in their own tables, NOT as columns on profiles: staff can read every profile row and RLS works per row.

-- The fixed monthly salary of each teacher / staff member / the owner.
create table public.salary_rates (
  profile_id uuid primary key references public.profiles (id),
  monthly_amount int not null check (monthly_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

-- One row per person per month. amount_due is copied from the rate when the month is set (and can be edited),
-- amount_paid is a running total (part payments), status is derived by the app on every save.
create table public.salary_months (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id),
  month date not null check (extract(day from month) = 1),
  amount_due int not null check (amount_due >= 0),
  amount_paid int not null default 0 check (amount_paid >= 0),
  status text not null check (status in ('unpaid', 'part', 'paid')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  unique (profile_id, month)
);
create index on public.salary_months (month);

alter table public.salary_rates enable row level security;
alter table public.salary_months enable row level security;

-- Only the owner. Nobody else (other staff, teachers, students, anon) gets a single row.
create policy owner_all on public.salary_rates for all to authenticated
  using (public.is_owner()) with check (public.is_owner());
create policy owner_all on public.salary_months for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

create trigger set_updated before update on public.salary_rates
  for each row execute function public.set_updated();
create trigger set_updated before update on public.salary_months
  for each row execute function public.set_updated();
