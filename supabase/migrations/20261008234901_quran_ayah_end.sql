-- Where each ayah ends (long ayahs run onto the next line or page).
-- Needed to count lines/pages for a hifz range. Table is still empty here.
alter table public.quran_ayahs
  add column end_page int not null check (end_page between 1 and 604),
  add column end_line int not null check (end_line between 1 and 15),
  add check ((end_page, end_line) >= (page, line));

create index on public.quran_ayahs (page);
