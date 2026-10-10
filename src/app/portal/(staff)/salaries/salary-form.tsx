"use client";

import { startTransition, useActionState } from "react";
import { saveSalary, type Result } from "./actions";

const input = "h-11 rounded-md border bg-background px-3 text-base";

// One person's record for one month: amount due, total paid so far, note.
export function SalaryForm({
  profileId,
  month,
  due,
  paid,
  note,
}: {
  profileId: string;
  month: string; // "YYYY-MM"
  due: number;
  paid: number;
  note: string;
}) {
  const [state, formAction, pending] = useActionState<Result, FormData>(saveSalary, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input type="hidden" name="profile_id" value={profileId} />
      <input type="hidden" name="month" value={month} />
      <label className="flex flex-col gap-1 text-sm">
        Salary due this month (₦)
        <input name="amount_due" type="number" min={0} step={1} inputMode="numeric" required defaultValue={due} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Total paid so far (₦)
        <input name="amount_paid" type="number" min={0} step={1} inputMode="numeric" required defaultValue={paid} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        Note
        <input name="note" defaultValue={note} className={input} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-primary" : "text-destructive"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
