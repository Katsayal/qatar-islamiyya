-- T.4: an account marked hidden is left out of the app's lists (directory, class and book teacher
-- pickers, Salaries) but not out of the Activity log. Set by hand in the database; no screen for it.
alter table public.profiles add column hidden boolean not null default false;
