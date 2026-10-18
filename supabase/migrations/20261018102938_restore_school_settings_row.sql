-- The settings table is a single row (id = 1) that the app only ever updates.
-- The live row was missing; put it back. Does nothing when it already exists.
insert into public.school_settings (id) values (1) on conflict (id) do nothing;
