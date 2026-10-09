# PROGRESS — Qatar Islamiyya Web App

> Read this at the start of every session. Work on the **first unchecked task** only. At the end: tick it, add a one-line note, commit, `/clear`.
> Remember: **SIMPLE IS KING** · mobile-first ·

## Current status
- **Phase:** Phase 1 done → next is Phase 2, task 2.1 Portal shell (Sonnet)
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
- [ ] **2.1 Portal shell** — mobile nav, role-based menu, dashboard placeholder.
- [ ] **2.2 Academic setup** — academic years, terms (dates cover the whole year; current term is automatic), classes, assign teachers.
- [ ] **2.3 Students list** — search, filter by program/class, totals.
- [ ] **2.4 Student form** — add/edit with photo upload, archive/restore, delete with confirm.
- [ ] **2.5 CSV import/export** — template, validation report, import. *(Opus if tricky)*
- [ ] **2.6 Applications** — review, accept → create student, reject.
- [ ] **2.7 Accounts** — staff create student logins; owner creates/disables teacher & staff.
- [ ] **2.8 Fees** — per student per term status; filter unpaid.

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
- 2026-10-08 — Planning complete. Simplifications agreed: no PWA, no i18n lib, no full audit log, no MFA/password rules, no absence alerts. Hosting = Netlify. Pro plan only.
- 2026-10-08 — No local Supabase/Docker: develop against a cloud DEV project; PROD project at go-live.
- 2026-10-08 — Clarified: application photos uploaded via Server Action (anon has no storage/table rights); term/class/recorder set by DB triggers; current term = term containing today.
