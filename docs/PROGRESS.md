# PROGRESS — Qatar Islamiyya Web App

> Read this at the start of every session. Work on the **first unchecked task** only. At the end: tick it, add a one-line note, commit, `/clear`.
> Remember: **SIMPLE IS KING** · mobile-first ·

## Current status
- **Phase:** Phase 0 — 0.1 done, next is 0.2 Design base
- **Last updated:** 2026-10-08

## Session prompt template
```
Read docs/PROGRESS.md and the SPEC/ARCHITECTURE/SCHEMA sections for the next task.
Task: <task name>. Mobile-first. Follow CLAUDE.md. Plan first, then build.
When done: typecheck + lint, commit, tick the task here with a short note.
```

---

## Phase 0 — Foundation  (Sonnet)
- [x] **0.1 Scaffold** — `create-next-app` (TS, Tailwind, App Router, src/), shadcn init, eslint, `typecheck` script, git init, push to GitHub. *(Done: Next 16.4, React 19.3, Tailwind 4, shadcn base-nova + button, `typecheck` script, local git only — GitHub push skipped for now. AGENTS.md from create-next-app says read node_modules/next/dist/docs/ before coding: this Next has breaking changes.)*
- [ ] **0.2 Design base** — fonts (Noto Sans, Noto Naskh Arabic, Amiri Quran), colour tokens (placeholder), mobile layout shell for public site (header, mobile menu, footer).
- [ ] **0.3 Supabase + Netlify** — create Supabase cloud DEV project, `supabase login` + `link`, `lib/supabase/*` (server/client/middleware), `.env.local`, deploy empty site to Netlify. (No local Supabase/Docker.)

## Phase 0b — Database & auth  (Opus)
- [ ] **0b.1 Schema migration** — all tables from SCHEMA.md + check constraints + indexes.
- [ ] **0b.2 RLS** — helper functions + policies; test accounts per role; `supabase/rls-checks.sql` for critical rules.
- [ ] **0b.3 Auth** — login page (email or admission no.), `getProfile`/`requireRole`, middleware protection, role redirects, seed one owner account.
- [ ] **0b.4 Qur'an data** — import `quran_ayahs` (page/line data, Madinah mushaf) + `lib/quran.ts` with tests.

## Phase 1 — Public website  (Sonnet)
- [ ] **1.1 Home** page (content file + sections).
- [ ] **1.2 About** + **Contact** (map embed, WhatsApp link, contact form → `contact_messages`).
- [ ] **1.3 Programs** — Tahfiz, Ma'ahad, Barnamaj (Arabic curriculum table).
- [ ] **1.4 Admissions** — rules (Hausa), fees, schedule, bank details, PDF form download, online application form (+ photo upload, consent).
- [ ] **1.5 News & Gallery** — read from `posts` (public) and `gallery_items`; SEO metadata, sitemap.

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
