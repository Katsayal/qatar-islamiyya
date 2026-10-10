# SCHEMA — Qatar Islamiyya Web App

> **SIMPLE IS KING**: fewest tables that meet the SPEC. Source of truth = `supabase/migrations/` (first: `20261008213115_init_schema.sql`, 21 tables). Keep this file in sync.

Conventions: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`. Editable tables also have `updated_at timestamptz` and `updated_by uuid → profiles.id`. Enum-like columns use `text` + `check (...)`.

## 1. People
### profiles  (1 row per auth user)
| column | type | notes |
|---|---|---|
| id | uuid PK | = auth.users.id |
| full_name | text | |
| phone | text | nullable |
| role | text | `teacher` · `staff` · `student` |
| is_owner | boolean | default false (staff only) |
| active | boolean | default true |

### students
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| admission_no | text unique | used for student login |
| full_name | text | |
| full_name_ar | text | nullable |
| gender | text | `male` · `female` |
| date_of_birth | date | nullable |
| photo_path | text | path in private `student-photos` bucket: `students/<id>.jpg`, or `applications/<application_id>.jpg` when created from an application (file is reused, not copied) |
| address, town | text | |
| previous_school | text | nullable |
| entry_level | text | `hadda` · `sauka` · nullable |
| medical_notes | text | "larura" |
| notes | text | special notes |
| guardian_name, guardian_phone, guardian_address, guardian_town | text | |
| class_id | uuid → classes | current class (one class = one program) |
| status | text | `active` · `graduated` · `withdrawn` · `archived` |
| admitted_on | date | |
| user_id | uuid → profiles | nullable, for student portal |

## 2. Structure
### academic_years
| id | name (`2026/2027`) | starts_on | ends_on |

### terms
| id | academic_year_id → academic_years | number (1–3) | starts_on | ends_on |

**Current term = the term whose dates contain today** (single source of truth; no `is_current` flags). Term dates must cover the whole year with no gaps (Aug–Nov, Dec–Mar, Apr–Jul). SQL helper: `term_for_date(date)`. The academic-setup form takes the year start + the three term end dates and derives each term start (previous end + 1 day), so gaps cannot be created.

### classes
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text | e.g. qari name / halqa name / "Barnamaj" |
| name_ar | text | nullable |
| program | text | `tahfiz` · `maahad` · `barnamaj` |
| level | int | nullable (Tahfiz 1–5+) |
| hifz_unit | text | `lines` · `pages` · null (Barnamaj) |
| sort_order | int | |
| active | boolean | |

### class_teachers
| class_id → classes | teacher_id → profiles | PK (class_id, teacher_id) |

## 3. Qur'an & hifz
### quran_ayahs  (reference, 6,236 rows, read-only)
| surah int | ayah int | page int (1–604) | line int (1–15) | end_page int | end_line int | juz int | PK (surah, ayah) |

Start and end position of each ayah (long ayahs span lines/pages). Data: generated migration `20261008234915_quran_ayahs_data.sql` from `scripts/build-quran-data.mjs` (quran.com API v4). No Qur'an text stored.

### hifz_entries
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| student_id | uuid → students | |
| class_id | uuid → classes | **set by trigger** = student's current class |
| term_id | uuid → terms | **set by trigger** = `term_for_date(entry_date)` |
| teacher_id | uuid → profiles | **set by trigger** = `auth.uid()` |
| entry_date | date | |
| absent | boolean | default false; if true, range/grade are null |
| lesson_type | text | `new` · `murajaah` |
| start_surah, start_ayah, end_surah, end_ayah | int | |
| start_page, end_page | int | computed |
| pages | numeric(5,2) | computed amount |
| lines | int | computed amount |
| grade | text | `jayyid` · `jayyid_jiddan` · `mumtaz` |
| note | text | nullable |
Index: (student_id, entry_date).

## 4. Barnamaj
### books
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| term_number | int | 1–3 |
| subject | text | الفن, e.g. الفقه |
| title | text | Arabic title |
| author | text | |
| study_type | text | `hifz` · `istizhar` · `sharh` · nullable (blank in the school's PDF; migration `20261009100754_books_study_type_nullable.sql`) |
| teacher_id | uuid → profiles | nullable |
| started_on, finished_on | date | nullable |
| sort_order | int | |

### attendance  (Barnamaj, one row per student per day)
| id | student_id → students | term_id → terms (**trigger** = `term_for_date(att_date)`) | att_date | status (`present` · `absent` · `excused`) | recorded_by → profiles (**trigger** = `auth.uid()`) |
Unique: (student_id, att_date).

### exam_results
| id | student_id | book_id → books | term_id (chosen in form, default current term) | score int (0–100) | entered_by (**trigger** = `auth.uid()`) |
Unique: (student_id, book_id, term_id).

## 5. Reports & fees
### report_comments
| id | student_id | term_id (chosen in form, default current term) | comment text | teacher_id (**trigger** = `auth.uid()`) |
Unique: (student_id, term_id).

### student_fees
| id | student_id | term_id | amount_due int (₦) | amount_paid int (₦, running total) | status (`unpaid` · `part` · `paid`, **derived by the app on every save**: paid ≥ due and due > 0 → paid; paid > 0 → part; else unpaid) | note |
Unique: (student_id, term_id).

### payment_proofs  (student portal phase)
| id | student_id | term_id | file_path | status (`pending` · `verified` · `rejected`) | verified_by |

## 6. Content
### posts
| id | title | body (markdown) | lang (`en` · `ar` · `ha`) | audience (`public` · `internal` · `students`) | cover_path | published_at | author_id |

### gallery_items
| id | image_path | caption | sort_order |

### documents
| id | title | file_path | category | visibility (`general` · `vault` · `students`) | uploaded_by |

## 7. Public intake & settings
### applications  (mirrors the paper form)
| id | program | full_name | date_of_birth | gender | address | town | previous_school | entry_level | photo_path (`student-photos` bucket, `applications/<id>.jpg`) | guardian_name | guardian_address | guardian_town | guardian_phone | medical_notes | notes | consent boolean | status (`new` · `accepted` · `rejected`) | student_id (set on accept) |

### contact_messages
| id | name | phone | message | handled boolean |

### correction_requests  (student portal phase)
| id | student_id | message | status (`open` · `done`) |

### school_settings  (single row)
| id = 1 | bank_name | account_name | account_number | signature_path |

## 8. Server-set fields (triggers)
A `before insert` trigger fills these; values sent from forms are ignored:
- `hifz_entries`: `term_id`, `class_id`, `teacher_id`
- `attendance`: `term_id`, `recorded_by`
- `exam_results.entered_by`, `report_comments.teacher_id`
- `updated_at` / `updated_by` on every editable table (before update)
Insert fails with a clear error if no term contains the date.

## 8a. Extra constraints & delete rules (from the init migration)
- `terms`: no overlapping date ranges (exclusion constraint); `number` unique per year.
- `hifz_entries`: absent ⇒ lesson/range/pages/lines/grade all null; present ⇒ all required (surah/ayah **and** page range stored).
- `profiles`: `is_owner` only allowed when `role = 'staff'`.
- `applications.consent` must be true. `school_settings` has exactly one row (`id = 1`), seeded.
- Deleting a student cascades to hifz, attendance, exams, comments, fees, proofs, correction requests; `applications.student_id` → null. Classes/profiles cannot be deleted while referenced (teachers are disabled via `active`).
- New auth user → `handle_new_user()` trigger (after insert **or update** of `raw_app_meta_data`, because Supabase's admin createUser sets app_metadata in a follow-up update) creates the `profiles` row from `role`, `full_name`, `is_owner`. Users without a role get no profile → no portal access. Later role changes go through `profiles`, not metadata.
- Context triggers use `auth.uid()`, so hifz/attendance/exam/comment inserts need a logged-in user.
- RLS policies: `20261008214129_rls.sql`. Helpers (`security definer`, false for inactive users, execute = authenticated only): `is_staff()`, `is_owner()`, `is_member()` (active teacher/staff), `teaches_class(id)`, `teaches_student(id)`, `my_student_id()`.
- `lock_fields()` before-update trigger on hifz/attendance/exams/comments keeps student, class, recorder (and book) unchanged; term recomputed from the date.
- Teachers cannot delete hifz/attendance (staff only). Teachers/students see only their own profile for now (widen when Phase 3/5 screens need teacher names).
- `hifz_lines_by_student(p_class, p_from, p_to)` (migration `20261009111346_…`, security invoker so RLS applies, execute = authenticated only): per active student of a class, lines of all `new` entries (all time and inside a date range). Used by the class page progress overview (3.3b) and later the staff dashboard (4.5); done in SQL because the API returns at most 1,000 rows.
- `term_report_stats(p_class, p_term)` (migration `20261010054453_term_report_stats.sql`, security invoker, execute = authenticated only): per active student of a class, all-time and in-term lines of new hifz, present/absent hifz days, grade counts on new lessons, and Barnamaj attendance counts for the term. Used by the report cards (4.4).
- Checks: `supabase/rls-checks.sql` (self-contained, rolls back) → `npx supabase db query --linked -f supabase/rls-checks.sql`.

## 9. RLS summary
| table | anon | student | teacher | staff |
|---|---|---|---|---|
| profiles | – | own | own | read all; edit student profiles only (role locked); owner edits anyone |
| students | – | own | select where teaches_class(class_id) | all |
| classes, class_teachers, terms, academic_years | – | select | select | all |
| quran_ayahs | – | select | select | select |
| hifz_entries | – | own | select/insert/update own classes | all |
| attendance, exam_results, report_comments | – | own | select/insert/update own classes | all |
| books | – | select | select | all |
| exam_results (teacher write) | – | – | only for books where `books.teacher_id` = them | all |
| student_fees | – | own | – | all |
| payment_proofs | – | own (insert/select) | – | all |
| posts | public only | public + students | public + internal | all |
| gallery_items | select | select | select | all |
| documents | – | `students` visibility | `general` + `students` | all incl. vault |
| applications, contact_messages | none (inserted by server action) | – | – | all |
| school_settings | select (bank details are public; signature file stays in a private bucket) | select | select | update |
| correction_requests | – | own (insert/select) | – | all |
