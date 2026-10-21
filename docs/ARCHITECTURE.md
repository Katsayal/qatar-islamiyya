# ARCHITECTURE — Qatar Islamiyya Web App

> **SIMPLE IS KING.** One Next.js app, one Supabase project, no extra services. Add complexity only when a real problem demands it.

## 1. Overview
```
Browser (mobile first)
   │
   ▼
Next.js app on Netlify
   ├─ [lang]/            public website, en at /… (proxy rewrite) + ar at /ar/… — static
   ├─ login/             Supabase Auth (email/password)
   ├─ portal/            teacher + staff (role checked)
   └─ portal/student/    student portal
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
| No i18n library | Portals are English only; the public site's two languages (§2a) are plain content objects + a `[lang]` segment |
| No offline mode | Plain mobile pages first; revisit only if network is a real problem |
| Activity log = one table + one generic trigger | The database records every write, so no page or action can forget it; only account actions (service-role) need an explicit call |

## 2a. Public site in two languages (R.3)
- **Routes:** every public page lives in `app/[lang]/…` (`lang` = `en` | `ar`); `[lang]/layout.tsx` has `generateStaticParams` (both prerendered), answers 404 for any other value and wraps the page in `<div lang dir>` (`<html lang>` stays `en`: one root layout for the whole app). Arabic pages use the `font-arabic-page` stack (`globals.css`: Noto Sans for Latin/digits/₦, Noto Naskh for Arabic, generated fallbacks last).
- **URLs:** English keeps the plain URLs. `src/proxy.ts` uses `publicRoute()` (`src/lib/lang.ts`, tested): `/about` → rewritten to `/en/about` (address bar unchanged), `/en/…` → 308 to the plain URL, `/ar/…`, portals, login, `/health`, `/api`, `/_next` and any path with a file extension are left alone. The rewrite goes through `updateSession(request, rewriteTo)`, so the session cookie refresh still happens.
- **Links:** server components get `lang` from the page and build links with `href(lang, "/about")`. Client code that reads `usePathname()` must pass it through `browserPath()` first (prerendered English pages see `/en/about`, the browser `/about`; without it the server and client disagree). The header has `LangSwitch` (same page in the other language): it shows only the other language, Qatar flag + "AR" or Nigeria flag + "EN" (inline SVG in `components/flags.tsx`, no image files; Windows draws no flag emojis), and uses `scroll={false}` so switching keeps the scroll height (exact on the home page; pages whose Arabic is shorter land in the same section, about 165 px higher on /programs).
- **Text:** public page text lives in `src/content/*.ts` as `{ en, ar }` with `const ar: typeof en` (TypeScript refuses a missing or extra Arabic field); shared words (menu, buttons, page titles, form labels and messages) in `src/content/ui.ts`. Pages read `ui[lang]` / `content[lang]`; client forms get their language's words as one prop `t`. Server actions return an error code (`"invalid"`, `"photo"`…), never a sentence, and the form shows `t.errors[code]`.
- **Posts and captions keep their own language:** news lists and articles set `lang`/`dir` from `posts.lang` (`PostBody` always sets `dir`, so an English post on an Arabic page stays left to right) and show `PostLangLabel` when it differs from the page; gallery captions use `dir="auto"`.
- **Dates:** news dates use `DualDate` (§6a): Hijri on top, Gregorian underneath, in the page language (Arabic: month names and Western digits). Timestamps go through `lagosDate()` first. (`formatDate` in `lib/lang.ts` was removed with H.1.)
- **Titles and hreflang:** each page's `generateMetadata` returns `pageMeta(lang, "/path", ui[lang].meta.x)` (`lib/page-meta.ts`: title + canonical + `en`/`ar`/`x-default` alternates); the `[lang]` layout sets the site title and description per language; `metadataBase` = `siteUrl` in the root layout. `sitemap.ts` lists every page and public post in both languages.
- **Refreshing public pages from the portal:** use `revalidatePath("/[lang]/gallery", "page")` or `revalidatePath("/[lang]", "layout")`, never the plain URL (it is not a route any more).
- A page whose params include something not known at build time (`/[lang]/news/[id]`) must read `params` inside `<Suspense>` (Cache Components), e.g. the article's back link.

## 3. Auth & roles
- Supabase email/password auth. Default password settings (no strength rules, no MFA).
- `public.profiles` row per user: `role` (`teacher` | `staff` | `student`), `is_owner`, `active`.
- **Students** log in with admission number: the login form converts `ADM123` → `adm123@students.qatar.local` (synthetic email) behind the scenes.
- **Student passwords:** staff create student logins in bulk (`accounts`: next 10 students without a login per click, one shared password typed by staff, never stored) or one by one. A student changes their own password in the profile (`supabase.auth.updateUser` with their own session); doing so sets `user_metadata.password_changed = true`, which the dashboard reminder reads; a staff reset clears it. Nothing is forced.
- Creating users (teachers/staff/students) is done by a **server action using the service-role key on the server only**, guarded by role checks (staff → students and teachers; owner → teachers, staff and the owner row). Everyone changes their own password with their own session (`supabase.auth.updateUser`): students on their profile, teachers/staff/owner on `/portal/account`. All of it lives in `portal/(staff)/accounts/actions.ts`.
- `lib/auth.ts`:
  - `getProfile()` — current user + profile (cached per request).
  - `requireRole(...roles)` — redirect to `/login` if not allowed. Used at the top of portal layouts/pages.
- Login redirect: staff/teacher → `/portal`, student → `/portal/student`. Wrong role on a page → sent to own home. Disabled (`active = false`) → signed out with a message.
- Admission no. → email: `admissionToEmail()` in `lib/login-id.ts` (re-exported by `lib/auth.ts`; lower-case, non `a-z0-9` → `-`, `@students.qatar.local`). Use it everywhere student accounts are created.
- **Teacher/staff login codes** (`QAT001`) reuse the same synthetic domain: `loginToEmail()` (email kept as typed, a code goes through `admissionToEmail`), `isLoginCode()`, and `loginLabel()` to show the code instead of the synthetic address (directory, messages, My account). Despite the name, `@students.qatar.local` also holds teacher and staff codes; a code equal to a student's admission no. is refused as "already exists".
- **Role change** (owner only, `changeRole` in `accounts/actions.ts`): a plain `profiles` update of `role` + `is_owner` with the owner's own session (RLS `owner_update`; check `not is_owner or role = 'staff'`, so owner = staff + flag); the activity-log trigger records it. The owner's own row is refused, which also keeps at least one owner. `app_metadata` is only read when the profile is first created, so it is not updated.
- **Password reminder:** `user_metadata.password_changed` is set to true by both own-password actions (student profile, My account) and to false by every staff/owner reset; both portal homes show the reminder while it is not true.
- Portal routes: `portal/(staff)/` (teacher+staff layout) and `portal/student/` (student layout), so `/portal/student` is not caught by the staff check.
- **Cache Components is on** (Next 16 default direction): anything reading the session (`getProfile`, Supabase server client) must render inside `<Suspense>`. Portal layouts wrap their shell in one `<Suspense>`; pages below are covered by it. `createClient()` (`lib/supabase/server.ts`) calls `await connection()` first: the Supabase session check reads `Date.now()`, which Next forbids during prerendering (incl. the partial-prefetch runtime stage), so every session read waits for the real request.
- **Kept-alive pages (stale forms):** with Cache Components, Next keeps up to 3 visited pages alive in React `<Activity>`, including form values and `useState`. Returning to one showed its old copy: an edit form could show old ticks and save them over newer data. Every portal page that **edits data** wraps its JSX in `<FreshOnVisit>` (`components/fresh-on-visit.tsx`, keyed on `useRouter().bfcacheId`). Its forms are re-created on each fresh visit (link click, redirect), while a form's own save (server re-render) and browser back/forward keep their state. **New edit pages must use it too.** Search/filter-only pages are not wrapped (remembering a filter is fine). Forms that switch data by a URL parameter are keyed by it: attendance `key={date}`, marks/comments `key={term.id}`, fee rows `key={term-student}`, salary rows `key={month-person}`.
- **Moving students between classes:** pure rules in `src/lib/student-moves.ts` (`planMoves`: matches CSV rows to students and active classes, tested), the database write in `src/lib/move-students.ts` (`moveToClasses`: one `update class_id` per destination class, through the user's session so RLS applies), used by two entry points: the tick-and-move bar on the Students list (`students/actions.ts`, `moveStudents`) and `students/move` (CSV). It never touches status, bio data or history; the activity log trigger records the class change.
- **Students CSV export:** `students/export/route.ts` exports what the Students list shows: the same filters through `parseStudentFilters` (`src/lib/student-filters.ts`, shared with the page), every page (`readAll` in `src/lib/read-all.ts` reads in chunks of 1,000 because the API caps a request at 1,000 rows), sorted by class order, then name, then admission no. in code. Friendly headings (`headingFor`, `exportKeys` in `students-csv.ts`) map back to the import columns through `columnFor`, so an export can be edited and used in Move by CSV; Medical Notes only with `&medical=1`. The button is a plain GET form on the Students page (no JavaScript).
- **One-field pickers** (term, date) use `components/picker-form.tsx`: Next's `<Form>` (`next/form`, GET → client navigation with the loading skeleton) that submits on change, plus a visually hidden "Show" button for keyboard/no-JS. Multi-field filter bars keep an explicit button.
- **Loading skeletons:** a click only re-renders below the shared layout, so a page needs its own `loading.tsx` to show something at once. Every top-level staff page (academic, academic/classes, account, accounts + its staff tab, books, documents, gallery, news, posts, promotion, reports, salaries, settings, students, fees, applications, messages, classes), the busy nested pages (class, student profile, record hifz, hifz history, attendance, student edit, payment proofs, book marks), the two portal homes and student hifz/fees/Barnamaj/report cards have a one-line `loading.tsx` re-exporting `components/page-skeleton.tsx`, and their `page.tsx` exports `instant = true`. `next.config.ts` sets `experimental.instantInsights.validationLevel: 'manual-warning'`, so dev checks only those pages. Give a new busy page the same two lines.
- **Public site:** no `loading.tsx` (it would hide headings that already render instantly). Each page keeps its static parts outside `<Suspense>` and only the data block waits, with a content-shaped skeleton from `components/page-skeleton.tsx` as the fallback: `CardsSkeleton` (home latest news, /news), `PhotosSkeleton` (/gallery), `ArticleSkeleton` (/news/[id]), `LinesSkeleton` (bank details on /admissions). About, Programs and Contact are fully static.
- Accounts seed: `node --env-file=.env.local scripts/unt/seed-users.mjs [--test]`. Owner from `OWNER_EMAIL/OWNER_PASSWORD/OWNER_NAME`; `--test` makes DEV-only test-staff / test-teacher / TEST001 (password in the script, refuses on non-DEV projects).

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
- **Owner only:** `salary_rates` and `salary_months` (`is_owner()`): not even other staff see a row. Their amounts are in separate tables, not columns on `profiles`, because RLS works per row and staff may read every profile.
- **Public (anon):** select posts where audience = 'public', gallery. **No** insert/storage rights: application and contact forms go through Server Actions (see §5a).

- **Hidden columns:** RLS is per row, so a column a role must not see (students' `notes`, `medical_notes`) is hidden with column privileges plus a security-definer reader (`student_notes()`); see SCHEMA §8a.

Other protections (F.1): `lib/supabase/admin.ts` imports `server-only` (built into Next) so the service-role client can never reach a client bundle; `next.config.ts` sends `X-Frame-Options: DENY`, `nosniff` and a referrer policy; CSV exports put `'` before cells starting with `= + - @` (formula injection; plain numbers like `+234…` are left alone); buckets have size/type limits. Supabase Auth sign-up must be **off** in the dashboard (of the single live project): accounts are created only by staff.

**Activity log (L.1):** `audit_log` is filled by the AFTER trigger `audit_row()` (security definer) on the tables listed in SCHEMA §8a: actor = `auth.uid()` + their name at that moment; edits store only changed fields and write nothing when nothing changed. Writes made with the service-role key have no `auth.uid()`, so the account actions in `accounts/actions.ts` call `rpc("log_action", …)` with the staff member's own session (staff only, actor taken from the session, never from the form). Read: owner only (`/portal/audit`); nobody can insert/update/delete rows through the API. **A new table must be added to the trigger list in a migration** (mode `full` or `edits`). Pruning: the owner runs `delete from audit_log where at < '…'` in the Supabase SQL editor.

RLS is checked by `supabase/rls-checks.sql`: one transaction that creates fake owner/staff/teacher/student/inactive users + data, asserts the critical rules per role, then rolls back. Run `npx supabase db query --linked -f supabase/rls-checks.sql` after every policy change. All helpers return false for inactive users, so `active = false` locks an account out of the data.

## 5. Storage buckets
| Bucket | Public? | Contents | Access |
|---|---|---|---|
| `site` | public | gallery, post covers | read: all · write: staff |
| `student-photos` | private | student photos (`students/…`) and application photos (`applications/…`) | staff: all · teacher: only if the path is the `photo_path` of a student in a class they teach (signed URLs) · anon: none |
| `documents` | private | general documents | teachers + staff |
| `vault` | private | sensitive docs | staff only |
| `private` | private | director signature (`signature/…`), payment proofs (`proofs/<student_id>/<uuid>.<ext>`: jpg, png, webp or pdf, ≤ 2 MB) | staff: all · students: read the one signature file named in `school_settings`, add + read files in their own `proofs/<own id>/` folder (no update/delete) |

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
- Table `quran_ayahs` (6,236 rows): surah, ayah, start page/line, end page/line, juz — Madinah 15-line mushaf.
- Data lives in a generated migration (applied with every other migration by `db push`), built once by `scripts/build-quran-data.mjs` from the quran.com API v4 word positions. Same script generates `lib/surahs.ts` (114 names ar/en + ayah counts).
- `lib/quran.ts` (pure, no imports): `amountForRange(startAyah, endAyah)` and `amountForPages(start, end)` → start/end page, `lines`, `pages` (= lines/15, 2 dp). Line index = (page−1)×15 + line. Ranges crossing a surah include its header/basmalah lines (agreed simplification). End-before-start throws; the 3.2 form should swap reversed Juz 'Amma ranges.
- Hifz entry form (3.2, `classes/[id]/students/[studentId]/hifz`): amount is always computed in the server action from `quran_ayahs`, never from the form. A reversed range (e.g. An-Nas → Ad-Duhaa) is swapped with `swapIfReversed` (pages mode: min/max). **Page mode** still stores surah/ayah (DB check): start = first ayah whose `end_page >= start page`, end = last ayah whose `page <= end page`. "Today" and the date limit use Africa/Lagos (`lib/today.ts`).
- Values are stored on the hifz row so reports are simple queries. Tests: `npm test` (Node built-in runner, `src/lib/*.test.ts`).

## 6a. Hijri dates (H.1, SPEC §11a)
- No library: `Intl.DateTimeFormat` with `islamic-umalqura` (Node and every current browser have it). Dates stay Gregorian ISO in the database.
- `lib/hijri.ts` (pure, tested, also used in client forms): `offsetFor` (latest `hijri_offsets` row on or before the date, else 0), `hijriDate(iso, offsets, lang)` (shift the date by the offset, then format: Hausa month names + "AH" for English pages and portals, Arabic names + "هـ" on `/ar`), `hausaWeekday`, `gregorianDate`. Days are handled as UTC midnight of the ISO date, so the server's time zone never moves a date.
- `lib/hijri-offsets.ts` `getHijriOffsets()` reads the whole (tiny) table once per request (React `cache`). Pages pass the list to `components/dual-date.tsx` (`DualDate`: Hijri on top, Gregorian smaller underneath; no hooks, so it works in server and client components).
- Timestamps (`posts.published_at`) go through `lagosDate()` (`lib/today.ts`) first, so a post's day is its Nigerian day.

## 7. Folder conventions
```
src/app/[lang]/page.tsx                   home (lang = en | ar)
src/app/[lang]/programs/page.tsx          one page: #tahfiz #maahad #barnamaj
src/app/[lang]/admissions/page.tsx        + actions.ts (application form)
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
- Fonts via `next/font/google`: **Noto Sans** (supports Hausa ɓ ɗ ƙ ƴ), **Noto Naskh Arabic** (`font-arabic`), **Amiri Quran** (`font-quran`). `subsets` only decides what is **preloaded**: keep it at Noto Sans `latin`; the Arabic fonts are `preload: false` (F.2: was ≈ 345 KB on every page). Other subsets still load on demand by unicode-range. **₦** is drawn by a local `@font-face "Naira Sign"` in `globals.css` (first in `--font-sans`), otherwise any page with a fee downloads Noto's 165 KB latin-ext file for that one character.
- Small gold text on a light background uses `text-gold-ink` (`--gold-ink`, 5:1 contrast); `text-gold` is for dark green backgrounds only.
- **Brand tokens** (`globals.css`, taken from the logo): `--primary` deep green, `--gold` (`bg-gold`, `text-gold`), `--deep` (`bg-deep`, the darkest green), warm page background (`--background` ≈ `oklch(0.962 0.012 100)`, `--muted` a step darker; cards are white `bg-card`). No dark mode (the `.dark` block is unused). Two CSS helpers: `.pattern-star` (faint gold eight-point star on dark green; put it on its own layer if the element also has a gradient, both use `background-image`) and `.gold-bar` (short gold bar under a page title: add it to every portal `<h1>`).
- **Card look:** `rounded-xl border bg-card shadow-sm`.
- **Buttons by function** (`components/buttons.ts`, `btn.*`; add `big` via `cn()` for a form's main action; always pair with a lucide icon):

  | Function | `btn.` | Look | Icon |
  |---|---|---|---|
  | Save / submit | `save` | solid green | `Check` |
  | Create / add | `create` | solid green | `Plus` / `UserPlus` |
  | Upload | `upload` | deep green | `Upload` |
  | Passwords, logins | `security` | gold | `KeyRound` |
  | Download, print, clear, enable, edit | `secondary` | white + border | `Download` / `Printer` / `X` / `Pencil` |
  | Delete, remove, disable | `danger` | red outline | `Trash2` / `Ban` |
  | Final delete | `dangerSolid` | solid red | `Trash2` |
- **File inputs** always use `fileInputClass` (same as the public application form). **Filter bars have no Filter button:** wrap them in `PickerForm` (dropdowns apply on change, text search on Enter) with `SearchField` for the search box.
- **Shared pieces** (`src/components/`): `form-parts.tsx` (`inputClass` = public forms, full width, h-12; `controlClass` = portal fields, no width, h-11, so filter bars keep their layout; `textareaClass`, `fileInputClass`, `Field`, `FormSection`; use these, do not hand-write field classes), `pager.tsx` (`Pager`: Previous | "Page [n] of N" dropdown that jumps to any page | Next, for every paged list: Students, Accounts, Fees, Payment proofs, Activity log; it takes the page's current filters as `params` and keeps them; chevron-only buttons on phones; lists sorted by name add `admission_no` as a tie-breaker so identical names cannot repeat or vanish between pages; page sizes: 50 for Students, Accounts and the log, 25 for Fees and proofs, whose rows are heavier), `confirm-submit.tsx` (`ConfirmSubmit`: the "Are you sure?" step of deletes, moves and role changes, shown on the page with "Yes, …" / Cancel; **never use `window.confirm`**, in-app browsers cancel it silently; `ask` may be a function reading the form, returning null = submit at once), `password-input.tsx` (`PasswordInput`: password box with an eye button, hidden by default and again after every submit; use it for every password the user types for themselves; the boxes where staff set someone else's password stay plain text on purpose), `page-tabs.tsx` (`PageTabs` + `accountTabs` / `academicTabs` / `studentTabs`: tabs above the title of a section with sub-pages; the active tab is solid green), `collapsible.tsx` (`Collapsible`: a card that is closed by default and opens on a tap; plain `<details>`/`<summary>` with a turning chevron, no JavaScript; used by the staff dashboard blocks), `status-badge.tsx` (coloured pill for any status: tone good / warn / bad / muted, text always says the status), `progress-bar.tsx`, `portal-title.tsx`, `dual-date.tsx` (`DualDate`, §6a), `portal-banner.tsx` (green greeting band on the portal homes, with today's Hijri + Gregorian date via `date`), `page-header.tsx` (green title band on public pages), `section-heading.tsx` (gold label + title), `cta-band.tsx` (Apply / WhatsApp / Call), `nav-link.tsx` (active-page link: `bar` public, `menu` phone card, `pill` portal bar; the home links `/`, `/portal`, `/portal/student` match exactly, others match the path and its children).
- **Public pages:** `PageHeader` band first, outside any `<Suspense>` (so the title renders instantly), then cards; 32px (`gap-8`, `pt-8`) between the band and the first card. **Portal shell:** deep-green header (logo, name and role, Log out, ☰), desktop menu as pills with a gold active pill, mobile menu as a rounded scrolling card.
- **Not restyled on purpose:** `report-card.tsx` (print / Save as PDF layout).
- Logical spacing classes so an Arabic (RTL) version can be added later.

## 9. Environments & deploy
- **No local Supabase / Docker** (simpler on Windows).
- Dev: `npm run dev` on your machine, connected to the free Supabase cloud project (`.env.local`), which is also the live database (see "Single live project" below): test rows are real rows, prefix them `ZZ` and delete them.
- **Stale dev cache:** on this machine Turbopack's dev cache can keep serving an old compiled copy of a CSS or component file after it changed on disk (seen three times). Symptom: the source is right but the page shows the old styling. Fix: stop the dev server, delete `.next/dev` (gitignored), start it again, refresh the phone.
- Testing in a browser: pages cannot be loaded in an iframe (`X-Frame-Options: DENY`, F.1), so check each page by navigating to it. Do not submit a login form before the page has hydrated (a native submit puts the login and password in the URL).
- Phone testing: open the "Network:" address the dev server prints (e.g. `http://192.168.x.x:3000`) on a phone on the same Wi-Fi/hotspot. `allowedDevOrigins` in `next.config.ts` allows the private ranges (`192.168.*.*`, `172.*.*.*`, `10.*.*.*`); without it Next blocks the dev scripts and client features (menu outside-tap, forms) don't run. Restart the dev server after changing it.
- Prod: Netlify (connected to GitHub, auto-deploy `main`, preview deploys for branches) on the single Supabase project (see below). A push to `main` deploys straight to the live site.
- Free Supabase projects pause after ~1 week of no activity; the keep-alive monitor below prevents it (otherwise restore from the dashboard). The free plan has no backups.
- **Single live project (decided 2026-10-18):** the Supabase DEV project (Frankfurt, eu-central-1) is also the live database; there is no separate PROD project. The Netlify site is https://qatar-islamiyya.netlify.app; Netlify functions run in Ohio (US East), locked on the free plan, so every database call crosses the Atlantic (accepted: public pages score 87-100 on PSI mobile).
- **"Powered by Netlify" badge:** Netlify injects it (iframe `nl-badge-frame`, script `/.netlify/scripts/hud`) on Free-plan projects created after 2026-08-19; it covered the pagers' Next button. Switched **off** on 2026-10-21 in Netlify: Project configuration → General → Powered by Netlify badge (no code change). If it ever comes back, use that switch, not CSS.
- **Keep-alive (UptimeRobot):** a monitor requests `GET /health` (`src/app/health/route.ts`: one `school_settings` read, `{"ok":true}` or 503, no data in the body) every 5 minutes. Two reasons: the free Supabase project pauses after about a week without activity, and the first request after idle hits a Netlify cold start (about 5 s). The database alone would need only about one request a day; the short interval is for the cold start and for failure emails. Relax it to 15-30 minutes if Netlify usage looks high.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (server only), `NEXT_PUBLIC_SITE_URL` (the site's public address; set on Netlify, change it when the domain arrives, then redeploy).
- DB changes go through migrations only: `supabase migration new` → `supabase db push` (to the single live project: push the migration before the code that needs it). Never change tables by clicking in the dashboard.

## 10. Later additions (designed to slot in)
- Online payments: add `payments` table + Paystack webhook route; `student_fees` stays.
- Guardian accounts: add `guardian` role + `guardian_students` link table.
- Arabic portals: the public site is already English + Arabic without a library (§2a); the portals would follow the same `{ en, ar }` pattern, layouts already use logical classes.
