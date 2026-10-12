"use client";

import { KeyRound, UserPlus } from "lucide-react";
import { startTransition, useActionState } from "react";
import { btn } from "@/components/buttons";
import type { Result } from "./actions";
import { controlClass } from "@/components/form-parts";

// One password box + button. Used for "Create login" and "Set new password".
// The password is shown as typed on purpose: staff read it out to the student or teacher.
export function PasswordForm({
  action,
  idField,
  id,
  button,
  kind = "reset",
}: {
  action: (prev: Result, formData: FormData) => Promise<Result>;
  idField: string;
  id: string;
  button: string;
  /** create = a new login (green, person icon); otherwise a password reset (gold, key icon). */
  kind?: "create" | "reset";
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name={idField} value={id} />
      <input
        name="password"
        required
        minLength={6}
        autoComplete="off"
        placeholder="Password (at least 6 characters)"
        className={controlClass}
      />
      <button disabled={pending} className={kind === "create" ? btn.create : btn.security}>
        {kind === "create" ? <UserPlus aria-hidden /> : <KeyRound aria-hidden />} {pending ? "Saving…" : button}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
