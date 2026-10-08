-- Initial schema for Qatar Islamiyya. See docs/SCHEMA.md.
-- RLS is enabled on every table here with NO policies (deny all via the API).
-- Policies + storage buckets come in the next migration (task 0b.2).

-- ============================================================
-- 1. People
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null check (role in ('teacher', 'staff', 'student')),
  is_owner boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  check (not is_owner or role = 'staff')
);

-- ============================================================
-- 2. Structure
-- ============================================================

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- e.g. 2026/2027
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  check (starts_on <= ends_on)
);

create table public.terms (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years (id),
  number int not null check (number between 1 and 3),
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  check (starts_on <= ends_on),
  unique (academic_year_id, number),
  -- No two terms may overlap, so term_for_date() always has one answer.
  exclude using gist (daterange(starts_on, ends_on, '[]') with &&)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  program text not null check (program in ('tahfiz', 'maahad', 'barnamaj')),
  level int,
  hifz_unit text check (hifz_unit in ('lines', 'pages')), -- null for Barnamaj
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

create table public.class_teachers (
  class_id uuid not null references public.classes (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, teacher_id)
);
create index on public.class_teachers (teacher_id);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  admission_no text not null unique,
  full_name text not null,
  full_name_ar text,
  gender text not null check (gender in ('male', 'female')),
  date_of_birth date,
  photo_path text,
  address text,
  town text,
  previous_school text,
  entry_level text check (entry_level in ('hadda', 'sauka')),
  medical_notes text,
  notes text,
  guardian_name text,
  guardian_phone text,
  guardian_address text,
  guardian_town text,
  class_id uuid references public.classes (id),
  status text not null default 'active'
    check (status in ('active', 'graduated', 'withdrawn', 'archived')),
  admitted_on date,
  user_id uuid unique references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);
create index on public.students (class_id);

-- ============================================================
-- 3. Qur'an & hifz
-- ============================================================

create table public.quran_ayahs (
  surah int not null check (surah between 1 and 114),
  ayah int not null check (ayah >= 1),
  page int not null check (page between 1 and 604),
  line int not null check (line between 1 and 15),
  juz int not null check (juz between 1 and 30),
  primary key (surah, ayah)
);

create table public.hifz_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id),   -- trigger
  term_id uuid not null references public.terms (id),      -- trigger
  teacher_id uuid not null references public.profiles (id), -- trigger
  entry_date date not null default current_date,
  absent boolean not null default false,
  lesson_type text check (lesson_type in ('new', 'murajaah')),
  start_surah int, start_ayah int, end_surah int, end_ayah int,
  start_page int check (start_page between 1 and 604),
  end_page int check (end_page between 1 and 604),
  pages numeric(5, 2) check (pages >= 0),
  lines int check (lines >= 0),
  grade text check (grade in ('jayyid', 'jayyid_jiddan', 'mumtaz')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  -- Absent = no recitation data. Present = everything filled.
  check (
    (absent and lesson_type is null and grade is null
      and start_surah is null and start_ayah is null and end_surah is null and end_ayah is null
      and start_page is null and end_page is null and pages is null and lines is null)
    or
    (not absent and lesson_type is not null and grade is not null
      and start_surah is not null and start_ayah is not null and end_surah is not null and end_ayah is not null
      and start_page is not null and end_page is not null and pages is not null and lines is not null)
  )
);
create index on public.hifz_entries (student_id, entry_date);

-- ============================================================
-- 4. Barnamaj
-- ============================================================

create table public.books (
  id uuid primary key default gen_random_uuid(),
  term_number int not null check (term_number between 1 and 3),
  subject text not null,
  title text not null,
  author text,
  study_type text not null check (study_type in ('hifz', 'istizhar', 'sharh')),
  teacher_id uuid references public.profiles (id),
  started_on date,
  finished_on date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  term_id uuid not null references public.terms (id),         -- trigger
  att_date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'excused')),
  recorded_by uuid not null references public.profiles (id),  -- trigger
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  unique (student_id, att_date)
);
create index on public.attendance (att_date);

create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  book_id uuid not null references public.books (id),
  term_id uuid not null references public.terms (id), -- chosen in form
  score int not null check (score between 0 and 100),
  entered_by uuid not null references public.profiles (id), -- trigger
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  unique (student_id, book_id, term_id)
);

-- ============================================================
-- 5. Reports & fees
-- ============================================================

create table public.report_comments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  term_id uuid not null references public.terms (id), -- chosen in form
  comment text not null,
  teacher_id uuid not null references public.profiles (id), -- trigger
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  unique (student_id, term_id)
);

create table public.student_fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  term_id uuid not null references public.terms (id),
  amount_due int not null default 0 check (amount_due >= 0),   -- Naira
  amount_paid int not null default 0 check (amount_paid >= 0), -- Naira
  status text not null default 'unpaid' check (status in ('unpaid', 'part', 'paid')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id),
  unique (student_id, term_id)
);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  term_id uuid not null references public.terms (id),
  file_path text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  verified_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

-- ============================================================
-- 6. Content
-- ============================================================

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '', -- markdown
  lang text not null default 'en' check (lang in ('en', 'ar', 'ha')),
  audience text not null check (audience in ('public', 'internal', 'students')),
  cover_path text,
  published_at timestamptz, -- null = draft
  author_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);
create index on public.posts (audience, published_at);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null,
  category text,
  visibility text not null check (visibility in ('general', 'vault', 'students')),
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

-- ============================================================
-- 7. Public intake & settings
-- ============================================================

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  program text not null check (program in ('tahfiz', 'maahad', 'barnamaj')),
  full_name text not null,
  date_of_birth date,
  gender text not null check (gender in ('male', 'female')),
  address text,
  town text,
  previous_school text,
  entry_level text check (entry_level in ('hadda', 'sauka')),
  photo_path text,
  guardian_name text not null,
  guardian_address text,
  guardian_town text,
  guardian_phone text not null,
  medical_notes text,
  notes text,
  consent boolean not null check (consent), -- NDPA 2023: must be true
  status text not null default 'new' check (status in ('new', 'accepted', 'rejected')),
  student_id uuid references public.students (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

create table public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  message text not null,
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);

create table public.school_settings (
  id int primary key default 1 check (id = 1), -- single row
  bank_name text,
  account_name text,
  account_number text,
  signature_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  updated_by uuid references public.profiles (id)
);
insert into public.school_settings (id) values (1);

-- ============================================================
-- 8. Functions & triggers
-- ============================================================

-- The term whose dates contain d. Errors if none (terms must cover the year).
create function public.term_for_date(d date)
returns uuid
language plpgsql stable
set search_path = ''
as $$
declare
  t uuid;
begin
  select id into t from public.terms where d between starts_on and ends_on;
  if t is null then
    raise exception 'No term contains the date %. Ask staff to set up term dates.', d;
  end if;
  return t;
end;
$$;

-- Server-set context fields. Values sent from forms are overwritten.
create function public.set_hifz_context()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select class_id into new.class_id from public.students where id = new.student_id;
  if new.class_id is null then
    raise exception 'Student is not in a class.';
  end if;
  new.term_id := public.term_for_date(new.entry_date);
  new.teacher_id := auth.uid();
  return new;
end;
$$;
create trigger set_context before insert on public.hifz_entries
  for each row execute function public.set_hifz_context();

create function public.set_attendance_context()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.term_id := public.term_for_date(new.att_date);
  new.recorded_by := auth.uid();
  return new;
end;
$$;
create trigger set_context before insert on public.attendance
  for each row execute function public.set_attendance_context();

create function public.set_entered_by()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.entered_by := auth.uid();
  return new;
end;
$$;
create trigger set_context before insert on public.exam_results
  for each row execute function public.set_entered_by();

create function public.set_comment_teacher()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.teacher_id := auth.uid();
  return new;
end;
$$;
create trigger set_context before insert on public.report_comments
  for each row execute function public.set_comment_teacher();

-- updated_at / updated_by on every editable table.
create function public.set_updated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'academic_years', 'terms', 'classes', 'students', 'hifz_entries',
    'books', 'attendance', 'exam_results', 'report_comments', 'student_fees',
    'payment_proofs', 'posts', 'gallery_items', 'documents', 'applications',
    'contact_messages', 'correction_requests', 'school_settings'
  ] loop
    execute format(
      'create trigger set_updated before update on public.%I
         for each row execute function public.set_updated()', t);
  end loop;
end;
$$;

-- New auth user → profile row, from app_metadata (only settable server-side).
-- Creating a user without app_metadata.role fails, by design.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, is_owner)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'full_name', ''),
    new.raw_app_meta_data ->> 'role',
    coalesce((new.raw_app_meta_data ->> 'is_owner')::boolean, false)
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 9. RLS on (deny all until policies are added in 0b.2)
-- ============================================================

do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;
