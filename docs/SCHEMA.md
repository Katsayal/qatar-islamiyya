# SCHEMA — Qatar Islamiyya Web App

> Draft for Phase 0b. **SIMPLE IS KING**: fewest tables that meet the SPEC. The SQL migrations in `supabase/migrations/` become the source of truth once written; keep this file in sync.

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

**Current term = the term whose dates contain today** (single source of truth; no `is_current` flags). Term dates must cover the whole year with no gaps (Aug–Nov, Dec–Mar, Apr–Jul). SQL helper: `term_for_date(date)`.

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
| surah int | ayah int | page int (1–604) | line int (1–15) | juz int | PK (surah, ayah) |

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
| study_type | text | `hifz` · `istizhar` · `sharh` |
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
| id | student_id | term_id | amount_due int (₦) | amount_paid int (₦) | status (`unpaid` · `part` · `paid`) | note |
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

## 9. RLS summary
| table | anon | student | teacher | staff |
|---|---|---|---|---|
| profiles | – | own | own | all (owner: write teacher/staff) |
| students | – | own | select where teaches_class(class_id) | all |
| classes, class_teachers, terms, academic_years | – | select | select | all |
| quran_ayahs | – | select | select | select |
| hifz_entries | – | own | select/insert/update own classes | all |
| attendance, exam_results, report_comments | – | own | select/insert/update own classes | all |
| books | – | select | select | all |
| student_fees | – | own | – | all |
| payment_proofs | – | own (insert/select) | – | all |
| posts | public only | public + students | public + internal | all |
| gallery_items | select | select | select | all |
| documents | – | `students` visibility | `general` + `students` | all incl. vault |
| applications, contact_messages | none (inserted by server action) | – | – | all |
| school_settings | bank fields via view | select | select | all |
| correction_requests | – | own (insert/select) | – | all |
