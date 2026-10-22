# CLAUDE.md — Qatar Islamiyya Web App

## 0. GOLDEN RULE: SIMPLE IS KING
- Always choose the simplest solution that works. No over-engineering.
- No abstractions, layers, or libraries "for later". Build what the current task needs.
- Prefer built-in features (Next.js, Supabase, browser, Postgres) over new dependencies.
- Plain, readable code over clever code. Small files, clear names.
- When two approaches exist, pick the simpler one and say why in one line.
- Before adding any new dependency, ask: can this be done with what we already have?

## 1. Project
Website + portals for **Madrasatu Hajiya Hindatu (Qatar Multi-Purpose Centre)**, Zango Road, Daura, Katsina State, Nigeria.
- Public website in English (`/…`) and Arabic (`/ar/…`), with some Hausa content blocks
- Teacher & Staff portal (`/portal`)
- Student portal (`/portal/student`) — built last
- Programs: **Tahfiz**, **Ma'ahad**, **Barnamaj** (see `docs/SPEC.md`)

## 2. Docs map — read only the section you need
| Doc | Use it for |
|---|---|
| `docs/SPEC.md` | WHAT to build (features, rules, pages) |
| `docs/ARCHITECTURE.md` | HOW it is built (structure, auth, RLS, patterns) |
| `docs/SCHEMA.md` | Database tables, columns, policies |
| `docs/PROGRESS.md` | Current phase, next task, what is done |

Rules: start each session by reading `docs/PROGRESS.md`. When a decision changes, update the doc first, then the code. Tick tasks in PROGRESS.md at the end of each session.

## 3. Stack (locked)
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui (add components with the shadcn CLI only when needed)
- Supabase: Postgres + Row-Level Security, Auth, Storage (`@supabase/ssr`)
- Zod for validating form input in server actions
- Hosting: **Netlify** (Next.js runtime is automatic)
- No CMS. No offline/PWA. No i18n library (yet). No state-management library.

## 4. Commands
```
npm run dev          # local dev
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm audit --omit=dev # security check of what ships: run before every push
npm test             # node --test on src/lib/*.test.ts
npx supabase login                         # once
npx supabase link --project-ref <dev-ref>  # once, links the cloud project (= live database)
npx supabase migration new <name>          # create a migration file
npx supabase db push                       # apply migrations to the linked project
npx supabase gen types typescript --linked > src/lib/database.types.ts
```
No local Supabase / Docker. One Supabase cloud project (the former DEV project) is also the **live** database since 2026-10-18 (ARCHITECTURE §9): every `db push` and every test row hits live data, so keep throwaway rows small, prefixed `ZZ`, and delete them.

## 5. Folder structure (keep it flat)
```
src/
  app/
    [lang]/            # public website pages, English (/…) and Arabic (/ar/…), see ARCHITECTURE §2a
    login/
    portal/            # teacher + staff portal (role-checked)
      student/         # student portal (later)
  components/
    ui/                # shadcn components (generated)
    *.tsx              # shared app components
  lib/
    supabase/          # server.ts, client.ts, proxy.ts (session refresh; src/proxy.ts calls it)
    auth.ts            # getProfile(), requireRole()
    database.types.ts  # generated — never edit by hand
    quran.ts           # hifz range → pages/lines helpers
    hijri.ts           # Hijri dates (Umm al-Qura + staff offsets), see ARCHITECTURE §6a
supabase/
  migrations/          # SQL migrations = source of truth for the DB
  seed.sql
docs/
```

## 6. Coding conventions
- **Mobile-first always.** Design for ~375px width first, then `md:` / `lg:` up.
- Server Components by default. `"use client"` only for interactivity.
- Data writes = **Server Actions** in an `actions.ts` next to the page. Validate with Zod.
- Data reads = directly in Server Components via the Supabase server client.
- Security lives in **RLS policies**. UI hiding is convenience only, never the protection.
- Use Tailwind logical classes (`ms-`, `me-`, `ps-`, `pe-`, `text-start`) so RTL works.
- Arabic blocks: `<div lang="ar" dir="rtl" className="font-arabic">`. Hausa: `lang="ha"`.
- Public site text lives in `src/content/*.ts` as `{ en, ar }` (`const ar: typeof en`); shared words in `src/content/ui.ts`. Never hard-code English on a public page (ARCHITECTURE §2a).
- Qur'an text uses `font-quran`.
- Dates: store ISO (Gregorian) dates; where SPEC §11a lists them, display Hijri first with Gregorian underneath.
- Phone numbers: Nigerian format (+234 / 080...).
- No `any`. Use generated DB types.
- Keep components under ~150 lines; split when bigger.

## 7. Roles (summary — full matrix in SPEC.md)
- `teacher`: own classes' students, record hifz / attendance / exam marks / comments, read posts & documents.
- `staff`: everything teacher can + all students, CRUD records, classes, posts, documents, vault, fees, applications, report cards.
- `staff` also creates teacher accounts and resets/disables teachers.
- `is_owner` flag (staff only): manage staff accounts (create, reset, disable), create other owners, change anyone else's role (teacher ⇄ staff ⇄ owner), salaries, activity log, and everything staff can do. All owners are equal.
- `student`: own data only (portal phase).
- No public sign-up. Staff create all accounts. Plain passwords (no strength rules, no MFA for now).

## 8. Efficiency rules (working with Claude on the Pro plan)
- **Plan mode first** (Shift+Tab) for any feature; wait for approval before coding.
- Build in **small vertical slices**: migration → action → page → check.
- **Let tools generate boilerplate**: `create-next-app`, `npx shadcn add`, `supabase gen types`, `supabase migration new`. Never hand-write generated code.
- **Prefer CLIs over MCP tools** (`supabase`, `netlify`, `git`, `gh`).
- Read only files the task needs. Don't scan the whole repo.
- Run `npm run typecheck` and `npm run lint` before saying a task is done, and `npm audit --omit=dev` before every push.
- Stop the dev server before `npm install` / upgrades (Windows locks files and npm hangs), and delete `.next/dev` before restarting it (ARCHITECTURE §9).
- After each working slice: update the docs (PROGRESS status + task note, and SPEC/ARCHITECTURE/SCHEMA if affected). Commit or push only when the owner says so, with a clear message.
- Sonnet for normal work. Suggest switching to Opus only for: schema/RLS, auth, hifz calculations, hard bugs.
- Batch small fixes into one pass.
- If stuck after 2 attempts, stop and explain instead of looping.

## 9. Never do
- Never disable RLS or use the service-role key in client code.
- Never put student data in public storage buckets.
- Never edit `database.types.ts` or old migrations by hand (create a new migration).
- Never create a table without explicit grants in the same migration (Supabase stopped automatic grants on 2026-10-30; ARCHITECTURE §4 "Table grants").
- Never add a dependency without a one-line justification.
- Never build features not in SPEC.md without asking.
- Never read or commit `.env*` files.
