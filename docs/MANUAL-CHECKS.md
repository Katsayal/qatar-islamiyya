# Manual check guide: Phase 1 and Phase 2

Work top to bottom. Tick each box as you go. If something is wrong, note the step number and what you saw.
Test logins are given in the chat (not stored here). They exist on the **DEV** Supabase project only.

## 0. Setup
- [ ] Run `npm run dev`, open http://localhost:3000.
- [ ] In Chrome, open DevTools (F12) and turn on the **device toolbar** (phone icon). Use **iPhone SE / 375px** for the mobile checks and a normal window for desktop.
- [ ] Use two browsers (or one normal + one private window) so you can be logged in as two roles at once.
- [ ] DEV starts nearly empty: one academic year (2026/2027), the owner, 3 test accounts. You will create the rest in section 4 onward.

**Every page, on phone width:** no sideways scrolling, text readable, buttons easy to tap.

## 1. Public website (logged out)
| # | Page | Check |
|---|---|---|
| 1.1 | `/` Home | Bismillah and Arabic render right-to-left and in the Arabic font. Three program cards. "Apply now" goes to `/admissions`, "Our programs" to `/programs`. "Latest news" says no news yet. |
| 1.2 | Menu | On phone the ☰ opens and closes. Every link works (Home, About, Programs, Admissions, News, Gallery, Contact, Login). |
| 1.3 | `/about` | Shows placeholder sections (history, vision, mission, leadership). |
| 1.4 | `/programs` | Tahfiz, Ma'ahad, Barnamaj sections. Barnamaj shows 3 Arabic terms tables (right-to-left). Home cards' "Learn more" jump to the right section. |
| 1.5 | `/contact` | Address, 3 phone numbers (tap = call), WhatsApp link opens `wa.me/2348038102495`, map loads. |
| 1.6 | Contact form | Submit empty: browser blocks. Submit name + message: success text appears. (It is read later in section 7.) |
| 1.7 | `/admissions` | Fees (₦2,000 and ₦10,000), school days, Hausa rules (10 items), "Bank details will be announced soon". |
| 1.8 | PDF form | "download the paper form (PDF)" downloads a one-page form. |
| 1.9 | Application form | Submit with a bad phone (`12345`): clear error and **what you typed stays**. Submit without ticking consent: blocked. Submit a valid application with a small photo (JPG/PNG under 2 MB). Success text appears. Try a photo over 2 MB: clear error. |
| 1.10 | `/news`, `/gallery` | Empty-state messages (no posts or photos yet). |
| 1.11 | `/sitemap.xml` | Lists the public pages. |
| 1.12 | `/news/abc` | Shows a 404 page. |

## 2. Login and roles
| # | Do | Expect |
|---|---|---|
| 2.1 | `/login`, wrong password | "Wrong login details" and the **login you typed is still there**. |
| 2.2 | Log in as **staff** | Lands on `/portal`. Menu has Dashboard, Academic setup, My classes, Students, Applications, Messages, Fees, News posts, Documents, Accounts, Settings. Greyed items say "Coming soon". |
| 2.3 | Log out, log in as **teacher** | Lands on `/portal`. Menu has only Dashboard, My classes, Documents. |
| 2.4 | Log out, log in as **student** (`TEST001`) | Lands on `/portal/student` ("coming soon" page). |
| 2.5 | While logged in as the student, open `/portal` | Sent back to `/portal/student`. |
| 2.6 | While logged in as the teacher, open `/portal/students`, `/portal/fees`, `/portal/accounts`, `/portal/academic`, `/portal/applications`, `/portal/messages` | Each one sends you back to `/portal`. |
| 2.7 | Log out, then open `/portal` and `/portal/students` | Sent to `/login`. |
| 2.8 | Log in as **owner** | Same menu as staff, plus owner-only pages in section 8. |

## 3. Portal shell (as staff)
- [ ] Phone: ☰ opens a dropdown, "Public website" link at the bottom, Log out button works.
- [ ] Desktop: menu bar under the header.
- [ ] Dashboard shows greeting, "Staff portal", and a card per menu item (unbuilt ones say "Coming soon").

## 4. Academic setup (as staff) `/portal/academic`
- [ ] 2026/2027 shows 3 terms (1 Aug–30 Nov, 1 Dec–31 Mar, 1 Apr–31 Jul) and marks the **current** one.
- [ ] "Edit dates": change Term 1 end to an earlier date. Terms 2 and 3 start dates shift automatically, with no gaps. Change it back.
- [ ] Add a year with the **same name**: "already exists". Add one with dates out of order: clear error.
- [ ] Classes (`/portal/academic/classes`): create **one class per program**. Suggested: "Test Qari" (Tahfiz, level 1, lines), "Test Halqa" (Ma'ahad), "Test Barnamaj" (Barnamaj).
- [ ] Tahfiz with **no** unit: error. Ma'ahad saves as **pages** whatever you pick. Barnamaj saves with no unit or level.
- [ ] Teacher checkboxes list the test teacher. Assign them to Test Qari: the class list shows "Teachers: Test Teacher".
- [ ] Edit a class, untick Active: it shows greyed "(inactive)" and no longer appears in student dropdowns.
- [ ] Failed forms keep what you typed.

## 5. Students (as staff) `/portal/students`
- [ ] Add 3 students with **Add student**: one per class, different genders, one with a photo. Admission numbers like `T1`, `T2`, `T3`.
- [ ] Admission number typed in lowercase is saved **uppercase**.
- [ ] Duplicate admission number: "already used". Bad phone: clear error. Failed forms keep your typing.
- [ ] Photo shows on the edit page. Replace the photo: new one shows.
- [ ] List: search by name, by admission number (any case), filter by program, class and status. Counts at top (per program) look right. "Reset" clears.
- [ ] Row click opens the edit page. Edit a name, save, see it in the list.
- [ ] **Archive**: student leaves the default list, appears under Status = archived. **Restore** brings them back.
- [ ] **Delete**: wrong confirmation text is refused. Correct admission number deletes the student.
- [ ] Phone width: list and forms usable.

## 6. CSV import/export (as staff) `/portal/students/import`
- [ ] Download the **template**: opens in Excel with a header and one example row.
- [ ] Make a CSV with 3 good rows (use a class name that exists), save as CSV UTF-8, **Check file**: "no problems". Import. The 3 students appear.
- [ ] Make a CSV with mistakes (missing name, unknown class, repeated admission number, existing admission number, date `31/31/2015`): each is reported **with its row number** and **nothing is imported**.
- [ ] Day-first date `21/03/2015` and gender `M` / `F` are accepted. A phone typed without its leading 0 gets it back.
- [ ] Arabic names survive import and export.
- [ ] **Export CSV** (list page): opens in Excel with Arabic correct and every student.

## 7. Applications and Messages (as staff)
- [ ] `/portal/messages`: the contact message from 1.6 is there. "Mark as handled" moves it to Handled; filters Open / Handled / All work; phone number is tappable.
- [ ] `/portal/applications`: the application from 1.9 is listed as new, with the "N new" count.
- [ ] Open it: all details and the photo show.
- [ ] **Accept** with an existing admission number: refused. With a new one and a class: you land on the new student's page with all details and the same photo. The application now shows Accepted with a link to the student.
- [ ] Submit another application on the public site, then **Reject** it (inside "Reject this application…"). It shows under Rejected and its buttons are gone.

## 8. Accounts `/portal/accounts`
**As staff (not owner)**
- [ ] No link to "Teacher and staff accounts". Opening `/portal/accounts/staff` sends you back to `/portal/accounts`.
- [ ] Pick a student under "Needs login": password under 6 characters is refused. A valid password creates the login.
- [ ] The student now shows under "Has login". Log in as them in the other browser using the **admission number** and that password: you reach `/portal/student`.
- [ ] "Disable login": that student's login now says "This account is disabled". "Enable login" works again.
- [ ] "Set new password": the old password fails, the new one works.

**As owner**
- [ ] "Teacher and staff accounts →" link is visible and the page lists everyone with emails.
- [ ] Add a teacher (name, email, optional phone, password). A second one with the same email is refused. Log in as the new teacher: 3-item menu.
- [ ] Disable the new teacher: login refused. Enable again. Reset their password.
- [ ] Your own row has no disable button.

## 9. Fees (as staff) `/portal/fees`
- [ ] Opens on the current term. The term dropdown lists all three terms.
- [ ] Everyone shows "No record". Use **Set the fee for everyone…** with `10000`: all active students get an unpaid record. Run it again with another amount: "already have a record" and nothing changes.
- [ ] Open a student, enter paid `4000`, save: **Part-paid**. Enter `10000`: **Paid** (and they leave the default "Not fully paid" list). Enter `6000`: back to Part-paid. A negative number is blocked.
- [ ] Filters (Unpaid / Part-paid / Paid / No record / All), program, class and search all give sensible lists.
- [ ] Check the totals by hand: Due, Paid and Outstanding match your numbers.
- [ ] Switch to Term 2: everyone is "No record" again (terms are separate).

## 10. Extra security spot-checks
- [ ] Logged out, open `/portal/students/export`: sent to login (no file downloads).
- [ ] As teacher, open `/portal/students/export` and `/portal/students/import`: sent away.
- [ ] After disabling an account **while it is logged in**, its next page click sends it to login.
- [ ] As student, you can't open any staff URL.

## 11. Clean up (optional)
Delete the test students, classes and any test applications/messages you created, and remove the test teacher/staff accounts you added. Keep the 2026/2027 year and the three seeded test accounts.

## Known things (not bugs)
- Dev console shows a `Date.now()` warning for `/portal`. It does not happen in a production build.
- Many pages say "Coming soon": teacher tools (Phase 3), posts, documents, settings, reports (Phase 4) and the student portal (Phase 5).
- Bank details and About text are placeholders until the school supplies them.
- Student photos in lists are not shown on purpose (they are private); they show on the student's own page.
