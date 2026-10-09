-- The school's program PDF leaves the reading type blank for some books.
-- Allow null instead of inventing a value (the check constraint still limits non-null values).
alter table public.books alter column study_type drop not null;
