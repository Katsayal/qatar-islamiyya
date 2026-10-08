# SPEC — Qatar Islamiyya Web App

> Guiding principle: **SIMPLE IS KING.** Build the simplest thing that meets each requirement. All screens are **mobile-first**.

## 1. School
- **Name:** Madrasatu Hajiya Hindatu (Qatar Multi-Purpose Centre) — مدرسة الحاجة هندة (قطر دورا)
- **Address:** Zango Road, Daura, Katsina State, Nigeria
- **Phones:** 08038102495 · 09060456171 · 07038782451
- Pending: logo, brand colours, class names, about content, bank details, director signature, domain, photos.

## 2. Surfaces
1. **Public website** — open to everyone.
2. **Teacher & Staff portal** — `/portal`, login required.
3. **Student portal** — `/portal/student`, built last.

## 3. Roles & permissions
| Capability | Public | Student | Teacher | Staff | Staff + Owner |
|---|:-:|:-:|:-:|:-:|:-:|
| View public site, submit application/contact | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own records only | | ✅ | | | |
| View students in own classes | | | ✅ | ✅ | ✅ |
| Record hifz / Barnamaj attendance / exam marks / term comments (own classes) | | | ✅ | ✅ | ✅ |
| Read internal posts & general documents | | student posts only | ✅ | ✅ | ✅ |
| View all students, classes, totals | | | | ✅ | ✅ |
| Add / edit / archive / delete students | | | | ✅ | ✅ |
| Manage classes, teacher assignments, Barnamaj books | | | | ✅ | ✅ |
| Create posts, upload documents | | | | ✅ | ✅ |
| Staff-only vault documents | | | | ✅ | ✅ |
| Applications, fee status, report cards | | | | ✅ | ✅ |
| Create student accounts | | | | ✅ | ✅ |
| Create / disable teacher & staff accounts | | | | | ✅ |

- No public sign-up. Staff create accounts. Plain passwords, no MFA (for now).
- Student login = **admission number + password**.
- Guardian accounts: not now (guardian details stored on student record).

## 4. Academic calendar
- One calendar for all programs. Academic year Aug–Jul.
- **Term 1:** Aug–Nov · **Term 2:** Dec–Mar · **Term 3:** Apr–Jul.
- Promotion happens at end of year.

## 5. Programs
A student belongs to **exactly one class** (therefore one program). A teacher can teach many classes. Classes are mixed boys & girls (gender stored for reports only).

### 5.1 Tahfiz
- ~5 classes, Level 1 → 5+, each named after a famous qari (names pending). One teacher per class.
- Daily hifz entry: **New hifz** or **Muraja'ah** (teacher chooses).
- Amount unit set per class: **lines** (lower levels) or **pages** (higher levels).
- End of year: promotion to next level.

### 5.2 Ma'ahad (flagship)
- Full Qur'an memorisation in **one year** (3 terms), students and teachers in the mosque.
- Students grouped in **Halqas**; one teacher per halqa.
- Daily hifz entry, unit = pages. **Minimum 2 pages**; entries below 2 pages are flagged.
- Progress view: pages memorised / 604, % of Qur'an, simple pace indicator.

### 5.3 Barnamaj — "Program of Qualifying Students in Basic Islamic Education"
- **One class**, several teachers. Each teacher teaches a **book**; when finished, another teacher takes the next book.
- Curriculum: ~40 books per year grouped by term → subject (فن) → book (title, author, study type: حفظ / استظهار / شرح). Source: school's program PDF.
- **Attendance once per school day** (any assigned teacher can take it). Days: Sat–Sun 8:30–4:00, Tue–Wed 3:00–6:00.
- **End-of-term exam per book, marked out of 100.**

## 6. Hifz recording (Tahfiz + Ma'ahad)
- Mushaf: **Hafs, 604-page 'Uthmani Madinah print**.
- Teacher enters a range **by surah/ayah** or **by page**; system computes pages and lines from Qur'an reference data.
- Fields: date, student, lesson type (new / muraja'ah), range, grade (**Jayyid · Jayyid Jiddan · Mumtaz**), optional note.
- Only satisfactory recitations are recorded (no "repeat" grade).
- **Absent** option on the entry screen → the hifz record doubles as attendance for these programs.

## 7. Public website (mobile-first)
| Page | Content |
|---|---|
| Home | Hero/welcome (some Arabic), three programs, latest news, apply CTA |
| About | History, vision, mission, leadership (content pending) |
| Programs | Tahfiz, Ma'ahad, Barnamaj (Barnamaj shows Arabic curriculum table) |
| Admissions | Requirements & rules (Hausa), fees, schedule, **online application**, downloadable PDF form, bank details |
| News & Events | Posts with audience = public |
| Gallery | Images uploaded by staff |
| Contact | Phones, WhatsApp link, Google Maps embed (Zango Road), contact form |
| Login | One login page → redirects by role |

- Page text lives in the code (simple TS/MD content files). News/gallery come from the database.
- Arabic/Hausa sections are marked with `lang`/`dir`; no full translation for now.

## 8. Teacher portal
- **My classes** → student list → student profile (read-only).
- **Record hifz** (Tahfiz/Ma'ahad): fast mobile form per student, incl. Absent.
- **Barnamaj:** take daily attendance; enter exam marks for books they teach.
- **Term comment** per student (used on report card).
- Read internal posts and general documents.

## 9. Staff portal (all teacher features +)
- **Dashboard:** totals by program/class/gender, unpaid fees count, Ma'ahad students below pace.
- **Students:** list (search/filter), add/edit with photo upload, archive/restore, delete (with confirm), CSV import (template provided), CSV export.
- **Classes:** create/edit classes (program, level, hifz unit, name), assign teachers.
- **Promotion:** end-of-year bulk move students to next class.
- **Barnamaj books:** manage curriculum, assign teacher, mark started/finished.
- **Applications:** review → accept (creates student) / reject.
- **Fees:** per student per term: amount due, amount paid, status (Unpaid / Part-paid / Paid), note.
- **Report cards:** print-friendly page per student / per class (browser "Save as PDF"), includes teacher comment + director signature image.
- **Posts:** audience = Public / Internal (teachers+staff) / Students.
- **Documents:** General (teachers+staff) and **Vault** (staff only).
- **Accounts:** create student accounts; owners also manage teacher/staff accounts.
- **Settings:** school info, bank details, director signature. (Current term is automatic from term dates.)

## 10. Student portal (last phase)
- Dashboard: photo, class, teacher(s), term, fee status, announcements.
- Hifz: total pages / juz / %, juz grid that fills in, recent entries with grades & notes, days present. Ma'ahad: pace + projected completion.
- Barnamaj: attendance record, books done/current, exam marks.
- Report cards: view/print each term.
- Fees: status per term, bank details, **upload proof of transfer** (staff verify).
- Resources: timetable, curriculum, documents shared with students.
- Profile (read-only) + "request a correction".
- Students only see their own data. No leaderboards.

## 11. Fees & payments
- Now: bank account details shown on site/portal; staff mark fee status manually.
- Later: Paystack/Flutterwave (Stripe does not serve Nigerian merchants directly). Add a `payments` table then; nothing else changes.

## 12. Non-functional
- Mobile-first, light pages (optimised images via `next/image`).
- RLS on every table. Private storage for student photos, documents, vault, signature.
- Nigeria Data Protection Act 2023: consent checkbox on application form; collect only needed data.
- Daily Supabase backups (built-in).
- Simple change tracking: `updated_at` / `updated_by` on editable tables.

## 13. Deliberately deferred (keep simple)
- Offline/PWA mode · full Arabic/Hausa translation & i18n library · full audit log · MFA / password rules · absence alerts · guardian accounts · online payments · SMS/WhatsApp notifications · certificates · recitation audio.
