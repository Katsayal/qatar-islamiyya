import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createStudentLogin, resetPassword, setActive } from "./actions";
import { AccountsTabs } from "./accounts-tabs";
import { BulkLoginForm } from "./bulk-login-form";
import { LOGIN_BATCH } from "./constants";
import { PasswordForm } from "./password-form";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const PAGE_SIZE = 25;
const shows = [
  { key: "needs", label: "Needs login" },
  { key: "has", label: "Has login" },
  { key: "all", label: "All" },
];
const input = "h-11 rounded-md border bg-background px-3 text-base";

type Search = { q?: string; show?: string; page?: string };

export default async function AccountsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const q = (sp.q ?? "").replace(/[%,()*]/g, " ").trim();
  const show = shows.some((s) => s.key === sp.show) ? sp.show! : "needs";
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("id, admission_no, full_name, user_id, profiles!students_user_id_fkey(active)", { count: "exact" })
    .eq("status", "active")
    .order("full_name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (show === "needs") query = query.is("user_id", null);
  if (show === "has") query = query.not("user_id", "is", null);
  if (q) query = query.or(`full_name.ilike.%${q}%,admission_no.ilike.%${q}%`);
  const [{ data: students, count }, { count: needLogin }] = await Promise.all([
    query,
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active").is("user_id", null),
  ]);
  const remaining = needLogin ?? 0;

  const lastPage = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const pageHref = (n: number) => `/portal/accounts?${new URLSearchParams({ q, show, page: String(n) })}`;

  return (
    <div className="max-w-2xl">
      <AccountsTabs active="students" />
      <h1 className="text-xl font-semibold">Student logins</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A student signs in with their admission number and the password you set here.
      </p>

      <section className="mt-4 rounded-lg border p-4">
        <h2 className="font-semibold">Create logins in bulk</h2>
        {remaining === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Every active student has a login.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Creates logins for up to {LOGIN_BATCH} students at a time. E.g. password: <em><span className="font-medium text-foreground">qatar999</span></em>.
              Type the password and press the button.{" "}
              <strong>
                {remaining} student{remaining === 1 ? "" : "s"} still need{remaining === 1 ? "s" : ""} a login.
              </strong>
            </p>
            <div className="mt-3">
              <BulkLoginForm batch={LOGIN_BATCH} remaining={remaining} />
            </div>
          </>
        )}
      </section>

      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input name="q" defaultValue={q} placeholder="Search Name or admission no." className={input} />
        <select name="show" defaultValue={show} className={input}>
          {shows.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button className="h-11 rounded-md bg-primary px-5 text-primary-foreground">Filter</button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">{count ?? 0} active student{count === 1 ? "" : "s"}</p>
      <ul className="mt-2 divide-y rounded-lg border">
        {(students ?? []).map((s) => {
          const login = s.user_id ? s.profiles : null;
          return (
            <li key={s.id} className="p-3">
              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{s.full_name}</span>
                    <span className="text-sm text-muted-foreground">{s.admission_no}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {!s.user_id ? "No login" : login?.active ? "Has login" : "Login disabled"}
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  {!s.user_id ? (
                    <PasswordForm action={createStudentLogin} idField="studentId" id={s.id} button="Create login" />
                  ) : (
                    <>
                      <PasswordForm action={resetPassword} idField="userId" id={s.user_id} button="Set new password" />
                      <form action={setActive.bind(null, s.user_id, !login?.active)}>
                        <button className="h-11 w-full rounded-md border px-4 text-sm hover:bg-muted">
                          {login?.active ? "Disable login" : "Enable login"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </details>
            </li>
          );
        })}
        {!students?.length && <li className="p-4 text-sm text-muted-foreground">No students here.</li>}
      </ul>

      {lastPage > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)} className="rounded-md border px-4 py-2">← Previous</Link> : <span />}
          <span className="text-muted-foreground">Page {page} of {lastPage}</span>
          {page < lastPage ? <Link href={pageHref(page + 1)} className="rounded-md border px-4 py-2">Next →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
