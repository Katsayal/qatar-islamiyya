# PROGRESS — Qatar Islamiyya Web App

> Read this at the start of every session. Work on the **first unchecked task** only. At the end: tick it, add a one-line note, commit, `/clear`.
> Remember: **SIMPLE IS KING** · mobile-first ·

## Current status
- **Phase:** Phase 2 done → next is Phase 3, task 3.1 My classes (Sonnet)
- **Last updated:** 2026-10-09

## Session prompt template
```
Read docs/PROGRESS.md and the SPEC/ARCHITECTURE/SCHEMA sections for the next task.
Task: <task name>. Mobile-first. Follow CLAUDE.md. Plan first, then build.
When done: typecheck + lint, commit, tick the task here with a short note.
```

---

## Phase 0 — Foundation  (Sonnet)
- [x] **0.1 Scaffold** — `create-next-app` (TS, Tailwind, App Router, src/), shadcn init, eslint, `typecheck` script, git init, push to GitHub. *(Done: Next 16.4, React 19.3, Tailwind 4, shadcn base-nova + button, `typecheck` script, local git only — GitHub push skipped for now. AGENTS.md from create-next-app says read node_modules/next/dist/docs/ before coding: this Next has breaking changes.)*
- [x] **0.2 Design base** — fonts (Noto Sans, Noto Naskh Arabic, Amiri Quran), colour tokens (placeholder), mobile layout shell for public site (header, mobile menu, footer). *(Done: fonts via next/font, green placeholder primary, (public) layout with <details> mobile menu — no client JS. Footer has no dynamic year: Next 16 cache components forbid new Date() in prerender.)*
- [x] **0.3 Supabase + Netlify** — create Supabase cloud DEV project, `supabase login` + `link`, `lib/supabase/*` (server/client/middleware), `.env.local`, deploy empty site to Netlify. (No local Supabase/Docker.) *(Done: DEV project zjhtblrdwjfdzwutjpzs linked, lib/supabase/{client,server,proxy}.ts + src/proxy.ts, env vars use PUBLISHABLE_KEY / SECRET_KEY naming. Netlify deploy deferred until MVP, by decision.)*

## Phase 0b — Database & auth  (Opus)
- [x] **0b.1 Schema migration** — all tables from SCHEMA.md + check constraints + indexes. *(Done: 21 tables pushed to DEV, triggers (context, updated_*, handle_new_user), RLS on with no policies yet, types generated + wired into clients. For 0b.2: lock teacher_id/term_id on update; revoke public execute on term_for_date.)*
- [x] **0b.2 RLS** — helper functions + policies; test accounts per role; `supabase/rls-checks.sql` for critical rules. *(Done: 54 policies + 5 buckets on DEV, lock_fields trigger, rls-checks.sql passes (self-contained, rolls back, run via `supabase db query`). Persistent role test accounts moved to 0b.3.)*
- [x] **0b.3 Auth** — login page (email or admission no.), `getProfile`/`requireRole`, middleware protection, role redirects, seed one owner account. *(Done: login by email or admission no., getProfile/requireRole/homeFor, portal/(staff) + portal/student layouts, logout. Fix migration: profile trigger also on app_metadata update. Test accounts seeded on DEV; verified in browser: wrong pw, teacher, student (TEST001), role bounce, logout, disabled. **Owner not seeded yet**: add OWNER_* to .env.local and run the seed script.)*
- [x] **0b.4 Qur'an data** — import `quran_ayahs` (page/line data, Madinah mushaf) + `lib/quran.ts` with tests. *(Done: 6,236 ayahs with start+end page/line + juz on DEV via generated migration; lib/surahs.ts; lib/quran.ts + 7 tests (npm test). Owner account seeded.)*

## Phase 1 — Public website  (Sonnet)
- [x] **1.1 Home** page (content file + sections). *(Done: hero + CTAs, 3 program cards from src/content/home.ts, latest 3 public posts in <Suspense> (src/components/latest-news.tsx). News items are not links yet: /news/[id] comes in 1.5. Program cards link to /programs#slug (page in 1.3).)*
- [x] **1.2 About** + **Contact** (map embed, WhatsApp link, contact form → `contact_messages`). *(Done: About text is placeholder in src/content/about.ts until the school sends content; contact form = server action + honeypot + server-only admin client src/lib/supabase/admin.ts; map = plain Google Maps iframe, no API key. Fixed 1.1: dropped new Date() filter in latest-news (RLS already hides drafts). One test row left in DEV contact_messages.)*
- [x] **1.3 Programs** — Tahfiz, Ma'ahad, Barnamaj (Arabic curriculum table). *(Done: one /programs page with #tahfiz #maahad #barnamaj sections (copy in src/content/programs.ts); curriculum = 43 books copied by eye from the PDF into src/content/barnamaj.ts, shown by components/curriculum-table.tsx. A few authors/types are blank in the PDF itself. Proofread the Arabic with the school before launch.)*
- [x] **1.4 Admissions** — rules (Hausa), fees, schedule, bank details, PDF form download, online application form (+ photo upload, consent). *(Done: /admissions page = fees, school days, Hausa rules (src/content/admissions.ts), bank details read from school_settings (shows "announced soon" until staff fill them), paper form public/admission-form.pdf (page 7 of the school PDF), online form with optional photo, consent and honeypot via server action + admin client. Tested end to end on DEV (row + photo). next.config: serverActions bodySizeLimit 3mb. Fees amounts/Hausa wording copied from the PDF: confirm with the school. Test application + contact rows left in DEV for staff to delete.)*
- [x] **1.5 News & Gallery** — read from `posts` (public) and `gallery_items`; SEO metadata, sitemap. *(Done: /news list + /news/[id] (public posts only; body shown as plain paragraphs, markdown renderer comes with 4.1), /gallery grid, images via next/image from the public `site` bucket (remotePatterns in next.config, helper src/lib/site.ts), src/app/sitemap.ts, home news links to posts. Tested on DEV with temporary data (removed). Set NEXT_PUBLIC_SITE_URL at go-live for the sitemap.)*

## Phase 2 — Staff core  (Sonnet; Opus where noted)
- [x] **2.1 Portal shell** — mobile nav, role-based menu, dashboard placeholder. *(Done: src/components/portal-menu.ts = one role-filtered list for the header menu (mobile <details> + desktop bar) and dashboard shortcuts; unbuilt pages show greyed "soon": remove `soon: true` when each task lands. Checked as test-staff (9 items) and test-teacher (2 items). Known dev-only warning from 0b.3, not from 2.1: /portal logs a Date.now() prerender error from the staff layout (session check); production build is fine.)*
- [x] **2.2 Academic setup** — academic years, terms (dates cover the whole year; current term is automatic), classes, assign teachers. *(Done: /portal/academic = years + 3 terms from one form (start + three end dates, terms derived so no gaps; edits park terms in year 9000 first to dodge the overlap constraint); /portal/academic/classes = list, add/edit, teacher checkboxes (Tahfiz/Ma'ahad max 1; Ma'ahad forced to pages; Barnamaj no unit/level), deactivate instead of delete. Real year 2026/2027 created on DEV. Forms now keep typed values after an error (onSubmit + startTransition) — also applied to contact + admissions. rls-checks.sql now clears real years inside its rolled-back transaction.)*
- [x] **2.3 Students list** — search, filter by program/class, totals. *(Done: /portal/students, staff only, read-only. GET filters (search name/admission no., program, class, status; default active), per-program active chips, 25 per page. No photos in the list (private bucket; comes with the 2.4 profile). Rows become links in 2.4. Tested with 30 throwaway students, since deleted.)*
- [x] **2.4 Student form** — add/edit with photo upload, archive/restore, delete with confirm. *(Done: /portal/students/new and /[id]; admission no. typed by staff (saved uppercase), photo to student-photos/students/<id>.jpg via the user client (staff storage policy), signed URL preview; archive/restore button; delete needs the admission no. typed and warns about cascade. List has Add button and row links. Tested on DEV: add, edit, replace photo, duplicate no., bad phone, archive, restore, delete (photo file removed). Throwaway data deleted.)*
- [x] **2.5 CSV import/export** — template, validation report, import. *(Opus if tricky)* *(Done: src/lib/students-csv.ts (parser/writer, 7 tests) + src/lib/student-schema.ts shared with the student form. /portal/students/export (all students, BOM for Excel) and ?template=1; /portal/students/import = check file (report with row numbers), then import; all-or-nothing, add-only, class matched by name, max 500 rows. Handles ; delimiter, day-first dates, m/f, Excel-stripped phone zeros. Date check now rejects impossible dates (also in the form). Tested on DEV; throwaway data deleted.)*
- [x] **2.6 Applications** — review, accept → create student, reject. *(Done: /portal/applications (status filter, default new) + /[id] detail with photo; Accept = admission no. + class (of the applied program) + date, creates the student reusing the application photo file, rolls the student back if the application update fails, then opens the student; Reject sits behind a <details> and is final in the UI. Also added /portal/messages (contact-form messages, open/handled filter, mark handled), listed in SPEC §9. Tested on DEV; throwaway data and the earlier 1.2/1.4 test rows deleted.)*
- [x] **2.7 Accounts** — staff create student logins; owner creates/disables teacher & staff. *(Done: /portal/accounts = student logins (filter needs/has/all, search): create login (admission no. + staff-set password, rolled back if linking fails), set new password, disable/enable. /portal/accounts/staff = owner only: list (emails via auth admin), add teacher/staff, reset password, disable/enable; you cannot disable yourself; non-owner staff may only reset student passwords (checked on the server). Passwords are plain, min 6, shown as typed. Service-role key only inside accounts/actions.ts. Tested on DEV: create + student login, wrong/old password, disable blocks login, owner-only redirect, teacher login + 2-item menu. Also: login form keeps the typed login after a wrong password. Test users, student and the temporary owner flag removed. No self-service password change (not in SPEC).)*
- [x] **2.8 Fees** — per student per term status; filter unpaid. *(Done: /portal/fees, staff only. Term picker (defaults to the current term), filters (not fully paid by default, unpaid, part, paid, no record, all + program/class/search), term totals (due/paid/outstanding + counts), 25 per page. Status is derived from the amounts on every save (paid >= due and due > 0 = paid; paid > 0 = part; else unpaid). "Set the fee for everyone" creates unpaid records only for active students with none for the term. Payments are a running total, overpayment counts as paid. Merging done in code, capped at 2,000 students. Tested on DEV (31 students, bulk set run twice, unpaid → part → paid → part, filters and totals checked against hand sums, term switch); test data removed.)*

## Phase 3 — Teacher tools
- [ ] **3.1 My classes** — teacher class list → students → profile (read-only).
- [ ] **3.2 Hifz entry** — by ayah or page, lesson type, grade, absent; computed pages/lines. *(Opus)*
- [ ] **3.3 Hifz history & Ma'ahad progress** — per student history, pages/604, below-2-pages flag, pace.
- [ ] **3.4 Barnamaj attendance** — daily roll call screen.
- [ ] **3.5 Barnamaj books & exams** — staff manage books/teachers; teachers enter marks /100.
- [ ] **3.6 Term comments** — teacher comment per student per term.

## Phase 4 — Content & reports  (Sonnet)
- [ ] **4.1 Posts** — create/edit, audience, cover image, markdown body.
- [ ] **4.2 Documents & Vault** — upload, list, signed-URL download, vault staff-only.
- [ ] **4.3 Gallery management.**
- [ ] **4.4 Report cards** — print-friendly page per student/class (hifz summary or exam marks, comment, signature).
- [ ] **4.5 Staff dashboard** — totals, unpaid fees, Ma'ahad below pace.
- [ ] **4.6 Promotion** — end-of-year bulk move to next class.
- [ ] **4.7 Settings** — school info, bank details, signature upload.

## Phase 5 — Student portal  (Sonnet)
- [ ] **5.1 Student dashboard** + profile + correction request.
- [ ] **5.2 Hifz progress** — totals, juz grid, recent entries, Ma'ahad pace.
- [ ] **5.3 Barnamaj** — attendance, books, exam marks.
- [ ] **5.4 Report cards, fees, proof-of-payment upload** (+ staff verify screen).
- [ ] **5.5 Resources & student posts.**

## Final pass
- [ ] **F.1 Review** — RLS re-check, security review. *(Opus)*
- [ ] **F.2 Performance & mobile polish** — Lighthouse, images, small screens.
- [ ] **F.3 Go-live** — domain, create Supabase PROD project + `db push` migrations, Netlify env vars, backups confirmed, owner handover notes.

---

## Pending from the school
- [ ] Logo & brand colours
- [ ] Tahfiz class names (qurra) and Ma'ahad halqa names
- [ ] About content: history, vision, mission, leadership
- [ ] Bank account details
- [ ] Director's signature image
- [ ] Barnamaj exam pass mark (if any)
- [ ] Domain name
- [ ] Photos for website & gallery

## Notes log
- 2026-10-09 — Admissions payment decided: applying stays open (rule says pay before starting). Fees page wording says form fee is once for new students, school fee is per term. Accept screen requires a "form fee received" tick and creates the current term fee record (default ₦10,000, editable, paid-so-far optional). Mobile menu now closes on outside tap / link tap.
- 2026-10-08 — Planning complete. Simplifications agreed: no PWA, no i18n lib, no full audit log, no MFA/password rules, no absence alerts. Hosting = Netlify. Pro plan only.
- 2026-10-08 — No local Supabase/Docker: develop against a cloud DEV project; PROD project at go-live.
- 2026-10-08 — Clarified: application photos uploaded via Server Action (anon has no storage/table rights); term/class/recorder set by DB triggers; current term = term containing today.
