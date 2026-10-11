import { PasswordChangeForm } from "@/components/password-change-form";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { changeOwnPassword } from "./actions";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

// "My account" for teachers, staff and the owner.
export default async function MyAccountPage() {
  const me = await requireRole("teacher", "staff");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold gold-bar">My account</h1>
        <dl className="mt-3 divide-y rounded-xl border text-sm bg-card shadow-sm">
          <div className="grid grid-cols-3 gap-2 p-3">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="col-span-2">{me.full_name}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            <dt className="text-muted-foreground">Role</dt>
            <dd className="col-span-2 capitalize">
              {me.role}
              {me.is_owner && " · owner"}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="col-span-2 break-all">{data.user?.email}</dd>
          </div>
        </dl>
      </div>

      <section>
        <h2 className="font-semibold">Change my password</h2>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          {me.is_owner
            ? "Keep it safe: there is no reset link for the owner, a forgotten owner password has to be reset from the Supabase dashboard."
            : `If you forget it, ask ${me.role === "teacher" ? "the office (staff)" : "the owner"} to reset it.`}
        </p>
        <PasswordChangeForm action={changeOwnPassword} />
      </section>
    </div>
  );
}
