"use client";

import { startTransition, useActionState, useRef } from "react";
import { UserPlus } from "lucide-react";
import { btn } from "@/components/buttons";
import { createStaffAccount, type Result } from "../actions";
import { controlClass } from "@/components/form-parts";

const input = controlClass;

// Staff can add teachers only; an owner can also add staff and owners (the server checks this too).
// After a successful add everything but the role is cleared, so the next person can be typed straight away.
export function AddAccount({ isOwner }: { isOwner: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<Result, FormData>(async (prev, fd) => {
    const result = await createStaffAccount(prev, fd);
    if (result.ok && formRef.current) {
      for (const name of ["full_name", "login", "phone", "password"]) {
        const field = formRef.current.elements.namedItem(name);
        if (field instanceof HTMLInputElement) field.value = "";
      }
    }
    return result;
  }, { ok: false, message: null });

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
        Full name *
        <input name="full_name" required autoComplete="off" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Login ID * (a code like QAT001, or an email)
        <input name="login" required autoComplete="off" autoCapitalize="none" spellCheck={false} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input name="phone" type="tel" autoComplete="off" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Role *
        <select name="role" required defaultValue="teacher" className={input}>
          <option value="teacher">Teacher</option>
          {isOwner && <option value="staff">Staff</option>}
          {isOwner && <option value="owner">Owner</option>}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password * (at least 6 characters; you give it to them)
        <input name="password" required minLength={6} autoComplete="off" className={input} />
      </label>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={btn.create}>
        <UserPlus aria-hidden /> {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
