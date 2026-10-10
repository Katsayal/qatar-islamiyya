"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createStaffAccount, type Result } from "../actions";

const input = "h-11 rounded-md border bg-background px-3 text-base";

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
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-primary" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
