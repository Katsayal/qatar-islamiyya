import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resetPassword, setActive } from "../actions";
import { PasswordForm } from "../password-form";
import { AddAccount } from "./add-account";

export default async function StaffAccountsPage() {
  const me = await requireRole("staff");
  if (!me.is_owner) redirect("/portal/accounts"); // owner only

  const supabase = await createClient();
  const [{ data: people }, { data: users }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, is_owner, active, phone").in("role", ["teacher", "staff"]).order("full_name"),
    createAdminClient().auth.admin.listUsers({ perPage: 200 }), // emails live in auth.users
  ]);
  const email = new Map((users?.users ?? []).map((u) => [u.id, u.email]));

  return (
    <div className="max-w-2xl">
      <Link href="/portal/accounts" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Student logins
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Teacher and staff accounts</h1>

      <ul className="mt-4 divide-y rounded-lg border">
        {(people ?? []).map((p) => (
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
                {p.phone && <p className="text-sm text-muted-foreground">{p.phone}</p>}
                <PasswordForm action={resetPassword} idField="userId" id={p.id} button="Set new password" />
                {p.id !== me.id && (
                  <form action={setActive.bind(null, p.id, !p.active)}>
                    <button className="h-11 w-full rounded-md border px-4 text-sm hover:bg-muted">
                      {p.active ? "Disable account" : "Enable account"}
                    </button>
                  </form>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-semibold">Add an account</h2>
      <div className="mt-3 rounded-lg border p-4">
        <AddAccount />
      </div>
    </div>
  );
}
