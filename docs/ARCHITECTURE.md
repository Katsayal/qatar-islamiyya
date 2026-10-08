# ARCHITECTURE — Qatar Islamiyya Web App

> **SIMPLE IS KING.** One Next.js app, one Supabase project, no extra services. Add complexity only when a real problem demands it.

## 1. Overview
```
Browser (mobile first)
   │
   ▼
Next.js app on Netlify
   ├─ (public)/          public website — static where possible
   ├─ login/             Supabase Auth (email/password)
   ├─ portal/            teacher + staff (role checked)
   └─ portal/student/    student portal (later)
   │  proxy.ts (Next 16 name for middleware) → refresh session, block /portal for logged-out users
   │  Server Components read data · Server Actions write data
   ▼
Supabase
   ├─ Auth      (users; role lives in public.profiles)
   ├─ Postgres  (tables + RLS policies = the real security)
   └─ Storage   (public: site images · private: photos, documents, vault, signature)
```

## 2. Key decisions (and why they are simple)
| Decision | Why |
|---|---|
| One Next.js app for site + portals | One codebase, one deploy |
| Server Components for reads, Server Actions for writes | No API layer to maintain |
| Security in RLS | Protection holds even if UI has a bug |
| Student has a single `class_id` (no enrollments table) | One class per student is a rule; history is kept on hifz/attendance/exam rows (each stores `class_id`/`term_id`) |
| Program and level are columns on `classes` (no extra tables) | Only 3 fixed programs |
| Report cards = print-friendly HTML page | Browser "Save as PDF"; no PDF library |
| CSV import/export | Staff save Excel as CSV; tiny parser, no heavy library |
| Public page text in code files | Rarely changes; no CMS |
| No i18n library | English UI; Arabic/Hausa blocks just use `lang`/`dir` |
| No offline mode | Plain mobile pages first; revisit only if network is a real problem |
| `updated_at`/`updated_by` instead of audit log | Enough accountability for now |

## 3. Auth & roles
- Supabase email/password auth. Default password settings (no strength rules, no MFA).
- `public.profiles` row per user: `role` (`teacher` | `staff` | `student`), `is_owner`, `active`.
- **Students** log in with admission number: the login form converts `ADM123` → `adm123@students.qatar.local` (synthetic email) behind the scenes.
- Creating users (teachers/staff/students) is done by a **server action using the service-role key on the server only**, guarded by role checks (staff → students; owner → teachers/staff).
- `lib/auth.ts`:
  - `getProfile()` — current user + profile (cached per request).
  - `requireRole(...roles)` — redirect to `/login` if not allowed. Used at the top of portal layouts/pages.
- Login redirect: staff/teacher → `/portal`, student → `/portal/student`.

## 4. RLS approach
SQL helper functions (security definer, stable):
- `is_member()` → active teacher or staff.
- `teaches_student(student_id)` → student is in a class the user teaches.
- `is_staff()` → role = 'staff' and active.
- `is_owner()` → staff and is_owner.
- `teaches_class(class_id)` → exists in `class_teachers` for current user.
- `my_student_id()` → student row linked to current user (portal phase).

Pattern per table:
- **Staff:** full access (`is_staff()`).
- **Teacher:** select students where `teaches_class(students.class_id)`; insert/update hifz/attendance/exams/comments only for students in classes they teach.
- **Student:** select own rows only (`student_id = my_student_id()`).
- **Public (anon):** select posts where audience = 'public', gallery. **No** insert/storage rights: application and contact forms go through Server Actions (see §5a).

RLS is checked by `supabase/rls-checks.sql`: one transaction that creates fake owner/staff/teacher/student/inactive users + data, asserts the critical rules per role, then rolls back. Run `npx supabase db query --linked -f supabase/rls-checks.sql` after every policy change. All helpers return false for inactive users, so `active = false` locks an account out of the data.

## 5. Storage buckets
| Bucket | Public? | Contents | Access |
|---|---|---|---|
| `site` | public | gallery, post covers | read: all · write: staff |
| `student-photos` | private | student photos (`students/…`) and application photos (`applications/…`) | staff: all · teacher: only if the path is the `photo_path` of a student in a class they teach (signed URLs) · anon: none |
| `documents` | private | general documents | teachers + staff |
| `vault` | private | sensitive docs | staff only |
| `private` | private | director signature, payment proofs | staff (+ student own proof later) |

## 5a. Public forms (application, contact)
1. Form posts to a Server Action. Zod validates fields; photo must be jpg/png/webp, max 2 MB. Simple honeypot field against bots.
2. Server Action (server-only service-role client) uploads the photo to `student-photos/applications/<application_id>.jpg` and inserts the row.
3. Anon users never get table or storage permissions. Staff view photos via short-lived signed URLs.
4. On **Accept**, the new student's `photo_path` reuses the same file path (no copy).

## 5b. Server-set fields
Context fields are never trusted from forms. Postgres `before insert` triggers set them:
- hifz/attendance `term_id` = `term_for_date(date)`; hifz `class_id` = student's current class; recorder = `auth.uid()`.
- Current term = term whose dates contain today (no `is_current` flags to keep in sync).
- Exam marks and term comments: term chosen in the form (default current term), since they are often entered at term end.

## 6. Hifz calculation
- Table `quran_ayahs` (6,236 rows): surah, ayah, page (1–604), line (1–15) for the Madinah 'Uthmani mushaf, juz.
- Imported once via a seed script from an open dataset (e.g. quran.com API v4 page/line data).
- `lib/quran.ts`: given a range (surah:ayah → surah:ayah, or page → page) return start/end positions, `pages` (decimal) and `lines` (integer). Values are stored on the hifz row so reports are simple queries.

## 7. Folder conventions
```
src/app/(public)/page.tsx                 home
src/app/(public)/programs/[slug]/page.tsx tahfiz | maahad | barnamaj
src/app/(public)/admissions/page.tsx      + actions.ts (application form)
src/app/portal/layout.tsx                 requireRole('teacher','staff') + mobile nav
src/app/portal/classes/[id]/page.tsx      teacher class view
src/app/portal/hifz/new/page.tsx          + actions.ts
src/app/portal/students/...               staff only
src/content/*.ts                          public page text (en / ar / ha blocks)
```
- Each page that writes data has its own `actions.ts` beside it.
- Shared UI in `src/components/`. Generated shadcn in `src/components/ui/`.

## 8. Styling
- Tailwind + shadcn/ui, mobile-first.
- Fonts via `next/font/google`: **Noto Sans** (supports Hausa ɓ ɗ ƙ ƴ), **Noto Naskh Arabic** (`font-arabic`), **Amiri Quran** (`font-quran`).
- Brand colours as CSS variables (placeholders until the logo arrives).
- Logical spacing classes so an Arabic (RTL) version can be added later.

## 9. Environments & deploy
- **No local Supabase / Docker** (simpler on Windows).
- Dev: `npm run dev` on your machine, connected to a free Supabase cloud **DEV project** (`.env.local`).
- Prod: Netlify (connected to GitHub, auto-deploy `main`, preview deploys for branches) + a separate Supabase **PROD project**, created at go-live.
- Supabase free tier allows 2 active projects (DEV + PROD). Free projects pause after ~1 week of no activity; just restore from the dashboard.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (server only).
- DB changes go through migrations only: `supabase migration new` → `supabase db push` (to DEV; to PROD at deploy time by re-linking). Never change tables by clicking in the dashboard.

## 10. Later additions (designed to slot in)
- Student portal: `profiles.role = 'student'` + `students.user_id` + student RLS policies — already in schema.
- Online payments: add `payments` table + Paystack webhook route; `student_fees` stays.
- Guardian accounts: add `guardian` role + `guardian_students` link table.
- Full Arabic UI: add next-intl; layouts already use logical classes.
