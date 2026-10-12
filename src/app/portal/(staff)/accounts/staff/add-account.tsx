"use client";

import { startTransition, useActionState } from "react";
import { UserPlus } from "lucide-react";
import { btn } from "@/components/buttons";
import { createStaffAccount, type Result } from "../actions";
import { controlClass } from "@/components/form-parts";

const input = controlClass;

// Staff can add teachers only; the owner can also add staff (the server checks this too).
export function AddAccount({ canCreateStaff }: { canCreateStaff: boolean }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(createStaffAccount, { ok: false, message: null });

  return (
    <form
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
        Email * (used to sign in)
        <input name="email" type="email" required autoComplete="off" autoCapitalize="none" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input name="phone" type="tel" autoComplete="off" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Role *
        <select name="role" required defaultValue="teacher" className={input}>
          <option value="teacher">Teacher</option>
          {canCreateStaff && <option value="staff">Staff</option>}
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
