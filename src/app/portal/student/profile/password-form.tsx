"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { changePassword } from "./actions";

const input = "h-11 rounded-md border bg-background px-3 text-base";

export function PasswordForm() {
  const [result, formAction, pending] = useActionState(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the boxes after a successful change; after an error they keep what was typed.
  useEffect(() => {
    if (result?.ok) formRef.current?.reset();
  }, [result]);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        New password (at least 6 characters)
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Type it again
        <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className={input} />
      </label>
      {result && (
        <p role="alert" className={`text-sm ${result.ok ? "text-primary" : "text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-md bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
