"use client";

import { startTransition, useActionState } from "react";
import { setMonthSalaries, type Result } from "./actions";

// "Set salaries for <month>": creates the missing unpaid records from each person's monthly salary.
export function SetMonthForm({ month, label }: { month: string; label: string }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(setMonthSalaries, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="mt-4 rounded-lg border p-4"
    >
      <input type="hidden" name="month" value={month} />
      <p className="text-sm text-muted-foreground">
        Creates an unpaid record for every active teacher and staff member who has a salary set but no record for {label}.
        Existing records are never changed.
      </p>
      <button disabled={pending} className="mt-3 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Creating…" : `Set salaries for ${label}`}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`mt-2 text-sm ${state.ok ? "text-primary" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
