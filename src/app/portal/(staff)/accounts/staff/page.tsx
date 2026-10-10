import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resetPassword, setActive } from "../actions";
import { AccountsTabs } from "../accounts-tabs";
import { PasswordForm } from "../password-form";
import { AddAccount } from "./add-account";

const roles = [
  { key: "all", label: "Teachers & staff" },
  { key: "teacher", label: "Teachers" },
  { key: "staff", label: "Staff" },
];
const statuses = [
  { key: "active", label: "Active" },
  { key: "disabled", label: "Disabled" },
  { key: "all", label: "Any status" },
];
const input = "h-11 rounded-md border bg-background px-3 text-base";

type Search = { role?: string; status?: string; q?: string };

// Directory of teachers and staff. Staff and the owner see everyone; staff can act on teachers only,
// the owner on everyone (also enforced in actions.ts and by RLS).
export default async function StaffAccountsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const me = await requireRole("staff");
  const sp = await searchParams;
  const role = roles.some((r) => r.key === sp.role) ? sp.role! : "all";
  const status = statuses.some((s) => s.key === sp.status) ? sp.status! : "active";
  const q = (sp.q ?? "").replace(/[%,()*]/g, " ").trim();

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, role, is_owner, active, phone, class_teachers(classes(name))")
    .in("role", role === "all" ? ["teacher", "staff"] : [role])
    .order("full_name");
  if (status !== "all") query = query.eq("active", status === "active");
  if (q) query = query.ilike("full_name", `%${q}%`);

  const [{ data: people }, { data: users }] = await Promise.all([
    query,
    createAdminClient().auth.admin.listUsers({ perPage: 200 }), // emails live in auth.users
  ]);
  const email = new Map((users?.users ?? []).map((u) => [u.id, u.email]));
  const list = people ?? [];

  return (
    <div className="max-w-2xl">
      <AccountsTabs active="staff" />
      <h1 className="text-xl font-semibold">Teachers &amp; staff</h1>

      <form className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input name="q" defaultValue={q} placeholder="Search by name" className={input} />
        <select name="role" defaultValue={role} className={input}>
          {roles.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={input}>
          {statuses.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button className="h-11 rounded-md bg-primary px-5 text-primary-foreground">Filter</button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {list.length} {list.length === 1 ? "person" : "people"}
      </p>
      <ul className="mt-2 divide-y rounded-lg border">
        {list.map((p) => {
          const canManage = me.is_owner || p.role === "teacher";
          const classes = p.class_teachers.map((c) => c.classes?.name).filter(Boolean).join(", ");
          return (
            <li key={p.id} className="p-3">
              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.full_name}</span>
                    <span className="block truncate text-sm text-muted-foreground">{email.get(p.id) ?? "—"}</span>
                  </span>
                  <span className="shrink-0 text-end text-xs capitalize text-muted-foreground">
                    {p.role}
                    {p.is_owner && " · owner"}
                    {!p.active && <span className="block">disabled</span>}
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  {p.phone && (
                    <p className="text-sm text-muted-foreground">
                      <a href={`tel:${p.phone}`} className="text-primary underline-offset-4 hover:underline">{p.phone}</a>
                    </p>
                  )}
                  {p.role === "teacher" && (
                    <p className="text-sm text-muted-foreground">{classes ? `Teaches: ${classes}` : "No classes assigned yet."}</p>
                  )}
                  {canManage ? (
                    <>
                      <PasswordForm action={resetPassword} idField="userId" id={p.id} button="Set new password" />
                      {p.id !== me.id && (
                        <form action={setActive.bind(null, p.id, !p.active)}>
                          <button className="h-11 w-full rounded-md border px-4 text-sm hover:bg-muted">
                            {p.active ? "Disable account" : "Enable account"}
                          </button>
                        </form>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Only the owner can change this account.</p>
                  )}
                </div>
              </details>
            </li>
          );
        })}
        {!list.length && <li className="p-4 text-sm text-muted-foreground">Nobody matches.</li>}
      </ul>

      <h2 className="mt-8 font-semibold">Add an account</h2>
      <div className="mt-3 rounded-lg border p-4">
        <AddAccount canCreateStaff={me.is_owner} />
      </div>
    </div>
  );
}
