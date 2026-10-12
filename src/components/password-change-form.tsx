"use client";

import { KeyRound } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { controlClass } from "@/components/form-parts";

type Result = { ok: boolean; message: string } | null;

const input = controlClass;

// "New password + type it again" for the signed-in user. Used on the student profile and on /portal/account;
// the action decides who may call it (see changePassword / changeOwnPassword).
export function PasswordChangeForm({ action }: { action: (prev: Result, formData: FormData) => Promise<Result> }) {
  const [result, formAction, pending] = useActionState(action, null);
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
        <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending} className={cn(btn.security, big)}>
        <KeyRound aria-hidden /> {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
