import { KeyRound, Phone, UserRound } from "lucide-react";
import { PasswordChangeForm } from "@/components/password-change-form";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { changeOwnPassword, saveOwnPhone } from "./actions";
import { PhoneForm } from "./phone-form";
import { loginLabel } from "@/lib/login-id";
import { FreshOnVisit } from "@/components/fresh-on-visit";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

// "My account" for teachers, staff and the owner.
export default async function MyAccountPage() {
  const me = await requireRole("teacher", "staff");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const { data: mine } = await supabase.from("profiles").select("phone").eq("id", me.id).single();
  const role = me.is_owner ? "Owner" : me.role === "teacher" ? "Teacher" : "Staff";

  return (
    <FreshOnVisit>
      <div className="max-w-md space-y-6">
        <h1 className="text-2xl font-semibold gold-bar">My account</h1>

        <section className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <UserRound aria-hidden className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{me.full_name}</p>
              <StatusBadge tone="good">{role}</StatusBadge>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2 p-4 text-sm">
            <dt className="text-muted-foreground">Login</dt>
            <dd className="col-span-2 break-all">{loginLabel(data.user?.email)}</dd>
          </dl>
        </section>

        <section id="phone" className="scroll-mt-4 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <Phone aria-hidden className="size-4 text-primary" /> My phone number
          </h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Only the office (staff) and the owner can see it. Leave the box empty and save to remove it.
          </p>
          <PhoneForm action={saveOwnPhone} phone={mine?.phone ?? ""} />
        </section>

        <section id="password" className="scroll-mt-4 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <KeyRound aria-hidden className="size-4 text-primary" /> Change my password
          </h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            {me.is_owner
              ? "Keep it safe: there is no reset link for the owner, a forgotten owner password has to be reset from the Supabase dashboard."
              : `If you forget it, ask ${me.role === "teacher" ? "the office (staff)" : "the owner"} to reset it.`}
          </p>
          <PasswordChangeForm action={changeOwnPassword} />
        </section>
      </div>
    </FreshOnVisit>
  );
}
