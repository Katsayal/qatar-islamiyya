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
| Create teacher accounts; reset password / disable a teacher | | | | ✅ | ✅ |
| View the teacher & staff directory (read-only) | | | | ✅ | ✅ |
| Create staff accounts; reset password / disable staff | | | | | ✅ |
| Change own password | | ✅ | ✅ | ✅ | ✅ |
| Salary records (rates, monthly payments, CSV) | | | | | ✅ (owner only) |

- No public sign-up. Staff create accounts. Plain passwords, no MFA (for now).
- Student login = **admission number + password**. Staff create the logins in bulk (one shared starting password typed once, e.g. "qatar999", never stored; done in batches of 10 to stay inside the server time limit). Students can **change their own password** in their profile (plain, min 6 characters); staff can still reset it. Not forced at first login: the student dashboard shows a reminder until the student has set their own password.
- **Student bio data** (the school's own list): name, admission no., blood group, address, date of birth, gender, local government, previous Islamiyya. All eight are **required** in the application form and the staff student form. The **CSV import** is more relaxed, because the school's existing lists are incomplete: it requires only admission no., full name and gender (class is optional but must match an existing class); the other five may be empty (a cell with `X`, `-`, `N/A` or nothing is empty), and staff complete them later in the student form (which still needs all eight to save). A filled value that is wrong (bad date, unknown blood group) is still rejected. Admission no. is assigned by staff when the student is created or an application is accepted (the format, e.g. M26TF1023, is decided by the school). Optional: student phone, entry level, class, medical notes, guardian details, Arabic name, staff notes. Blood group is a dropdown (A+, A−, B+, B−, AB+, AB−, O+, O−, Unknown).
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
- Progress view: pages memorised / 604, % of Qur'an, simple pace indicator. Pages memorised = lines of all *new* entries ÷ 15. Pace (current academic year, calendar days): expected = 604 × days elapsed ÷ days in the year; "on track" at ≥ 90% of expected; projected finish = at the current rate.

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
| Home | Hero/welcome (some Arabic) and a quick-facts strip, three program cards, how admission works, school days and fees, latest news, Apply / WhatsApp / Call band, donation section |
| About | History, vision, mission, leadership (content pending) |
| Programs | Tahfiz, Ma'ahad, Barnamaj: what each one is, how it works, and an Apply button. No curriculum table on the site (the curriculum stays in the portal's Barnamaj books). Ends with the same Apply / WhatsApp / Call band as the home page. |
| Admissions | Requirements & rules (English; translated from the school's Hausa original), fees, schedule, **online application**, downloadable PDF form, bank details |
| News & Events | Posts with audience = public |
| Gallery | Images uploaded by staff |
| Contact | Phones, WhatsApp link, Google Maps embed (Zango Road), contact form |
| Donate | Linked from the last home-page section and the footer (not in the main menu). Shows the school bank details (same Settings record) and a WhatsApp / call link so donors can tell us about their gift. No online payment (see §11). |
| Login | One login page → redirects by role |

- Page text lives in the code (simple TS/MD content files). News/gallery come from the database.
- Arabic/Hausa sections are marked with `lang`/`dir`; no full translation for now.

## 8. Teacher portal
- **My classes** → class page → student page. Teachers see the classes they are assigned to. Staff see "Classes I teach" (classes they are assigned to) first, then "All other classes" (staff can open every class).
- **Class page:** the student list first (each row: progress + a Record button; Ma'ahad shows how many are behind pace; Barnamaj has "Take attendance" on top). An "End of term" card at the bottom leads to the term comments.
- **Student page:** name, admission no., class, Record hifz, and a closed "Contact & care" section (guardian, phone, medical notes; staff also get a link to the full record). No other bio data for teachers. Tahfiz/Ma'ahad: hifz summary, Ma'ahad pace, all entries with a term filter (staff can delete). Barnamaj: the chosen term's attendance and exam marks.
- Single term/date pickers load as soon as a value is picked (no "Go" button).
- **Record hifz** (Tahfiz/Ma'ahad): fast mobile form per student, incl. Absent.
- **Barnamaj:** take daily attendance; enter exam marks for books they teach.
- **Term comment** per student (used on report card).
- Read internal posts and general documents.

## 9. Staff portal (all teacher features +)
- **Dashboard:** totals by program/class/gender, unpaid fees count, Ma'ahad students below pace.
- **Students:** three tabs, like Accounts and Academic setup: Students | Import CSV | Move by CSV (the export button is on the Import CSV tab). List (search/filter), add/edit with photo upload, archive/restore, delete (with confirm), CSV import (template provided), CSV export. The CSV has 16 columns: admission_no, full_name, gender, date_of_birth, blood_group, address, local_government, previous_islamiyya, student_phone, class, entry_level, medical_notes, guardian_name, guardian_phone, guardian_address, guardian_local_government. Required on every row: admission_no, full_name and gender; date_of_birth, blood_group, address, local_government and previous_islamiyya may be empty (see §3). Column headers may also be written as in the school's sheets (Name, Admission Number, Blood Group, Date of Birth, Local Government, Previous Islamiyya, Class, …). Import is all-or-nothing and adds active students only (status, admitted-on, Arabic name and staff notes are edited in the student form). Export uses the same columns.
- **Classes:** create/edit classes (program, level, hifz unit, name, position in lists), assign teachers. Staff members who also teach can be assigned too (and as a Barnamaj book's teacher); the form has a name search. Academic years can be deleted only while nothing has been recorded in them (otherwise edit the dates).
- **Promotion:** end-of-year bulk move students to next class.
- **Moving students between classes (not a promotion):** e.g. splitting Ma'ahad into halqas, a transfer, a wrong class. Two ways, both change only the class (bio data, status, logins and history stay, and incomplete profiles are fine; the activity log records each change): (1) **Students list**: tick students on the page, choose a class, Move (per page; the selection clears when the page or a filter changes); (2) **Move by CSV** (`/portal/students/move`, a tab): Export all students (on the Import CSV tab), change the `class` column (or paste the school's list: only `admission_no` and `class` are read, other columns ignored), upload, Check file, Move. Admission no. must exist (any status), class must be an active class (exact name); already in that class = unchanged, not an error; a repeated admission no. is an error; max 500 rows; all-or-nothing; students not in the file are untouched. Past hifz/attendance rows keep the class they were recorded under.
- **Barnamaj books:** manage curriculum, assign teacher, mark started/finished.
- **Applications:** review → accept (creates student) / reject. Accepting requires confirming the one-off ₦2,000 form fee was received and creates the current term's fee record.
- **Messages:** read website contact-form messages, mark handled / not handled. Same page has a "Student corrections" view: read students' correction requests, mark done.
- **Fees:** per student per term: amount due, amount paid, status (Unpaid / Part-paid / Paid), note. **Payment proofs** (receipts uploaded by students) are listed on a sub-page: staff verify / reject them, then record the payment themselves (a proof carries no amount and never changes the balance by itself).
- **Report cards:** print-friendly page per student / per class (browser "Save as PDF"), includes teacher comment + director signature image.
- **Posts:** audience = Public / Internal (teachers+staff) / Students.
- **Documents:** General (teachers+staff), **Students** (also shown to students under "Resources": timetable, notes…) and **Vault** (staff only).
- **Accounts:** two tabs. **Student logins:** create (one by one, or in bulk with one shared password, 10 students per click), set a new password, disable/enable. **Teachers & staff:** a directory of everyone (filter by role, active/disabled, search; teachers show their classes; email and phone visible); staff can create teacher accounts and reset password / disable a teacher; only the owner creates staff accounts and manages staff and the owner. Teachers, staff and the owner change their own password on "My account" (plain, min 6 characters); a forgotten password is reset by staff (teachers) or the owner (staff).
- **Salaries (owner only):** record-keeping for teachers, staff and the owner, not payroll (no tax, pension, deductions or payslips). Each person has a **fixed monthly salary** the owner can change (a change affects future months only). Per month: amount due, total paid so far (part payments allowed, overpaying counts as paid), status Unpaid / Part-paid / Paid (derived), and a note. "Set salaries for this month" creates unpaid records for active people who have a salary and no record yet. Totals per month, filters, CSV export. Staff and teachers cannot see any of it, not even their own.
- **Activity log (owner only):** who created, edited or deleted what, and when, for audit and records. Logged automatically by the database (nothing in the app can skip it): academic years, terms, classes and teacher assignments, students, books, fees, posts, gallery, documents, settings, salaries (create, edit, delete); hifz, attendance, exam marks, term comments, payment proofs, applications, messages, correction requests and accounts' profiles (edit and delete only: new entries already store who recorded them). Account actions are logged with the staff member who did them: login/account created, password reset (never the password itself), disabled/enabled. Not logged: sign-ins and people changing their own password. Edits store only the changed fields (old → new); deletes keep the whole old row. Kept forever; the app can never edit or delete log rows (the owner can prune old rows in the Supabase SQL editor). One page with filters by person, area, action and month.
- **Settings:** bank details, director signature. (Current term is automatic from term dates. School name, address and phones are page text in `src/content/school.ts`, edited in code, not in Settings.)

## 10. Student portal (last phase)
- Dashboard: photo, class, teacher(s), term, fee status, announcements.
- Hifz: total pages / juz / %, juz grid that fills in, recent entries with grades & notes, days present. Ma'ahad: pace + projected completion.
- Barnamaj: attendance record, books done/current, exam marks.
- Report cards: view/print each term.
- Fees: status per term, bank details, **upload proof of transfer** (staff verify).
- Resources: timetable, curriculum, documents shared with students.
- Profile (read-only) + "request a correction": shows the bio data (incl. blood group and student phone), class, admission no. and guardian details; medical notes and staff notes are hidden. Students change their own password here.
- Students only see their own data. No leaderboards.

## 11. Fees & payments
- Now: bank account details shown on site/portal; staff mark fee status manually.
- Donations (`/donate`): same bank account, same manual approach; no donation records are kept in the app.
- Later: Paystack/Flutterwave (Stripe does not serve Nigerian merchants directly). Add a `payments` table then; nothing else changes.

## 12. Non-functional
- Mobile-first, light pages (optimised images via `next/image`).
- RLS on every table. Private storage for student photos, documents, vault, signature.
- Nigeria Data Protection Act 2023: consent checkbox on application form; collect only needed data.
- Daily Supabase backups (built-in).
- Change tracking: `updated_at` / `updated_by` on editable tables, plus the owner-only activity log (§9).

## 13. Deliberately deferred (keep simple)
- Offline/PWA mode · full Arabic/Hausa translation & i18n library · sign-in log · MFA / password rules · absence alerts · guardian accounts · online payments · SMS/WhatsApp notifications · certificates · recitation audio.
