"use client";

import { startTransition, useActionState } from "react";
import type { Result } from "./actions";

// One password box + button. Used for "Create login" and "Set new password".
// The password is shown as typed on purpose: staff read it out to the student or teacher.
export function PasswordForm({
  action,
  idField,
  id,
  button,
}: {
  action: (prev: Result, formData: FormData) => Promise<Result>;
  idField: string;
  id: string;
  button: string;
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
        className="h-11 rounded-md border bg-background px-3 text-base"
      />
      <button disabled={pending} className="h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Saving…" : button}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-primary" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
