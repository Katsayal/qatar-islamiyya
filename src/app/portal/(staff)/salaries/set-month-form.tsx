"use client";

import { startTransition, useActionState } from "react";
import { setMonthSalaries, type Result } from "./actions";
import { Plus } from "lucide-react";
import { btn } from "@/components/buttons";

// "Set salaries for <month>": creates the missing unpaid records from each person's monthly salary.
export function SetMonthForm({ month, label }: { month: string; label: string }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(setMonthSalaries, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="mt-4 rounded-xl border p-4 bg-card shadow-sm"
    >
      <input type="hidden" name="month" value={month} />
      <p className="text-sm text-muted-foreground">
        Creates an unpaid record for every active teacher and staff member who has a salary set but no record for {label}.
        Existing records are never changed.
      </p>
      <button disabled={pending} className={`${btn.create} mt-3`}>
        <Plus aria-hidden /> {pending ? "Creating…" : `Set salaries for ${label}`}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 mt-2 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
