"use client";

import { startTransition, useActionState } from "react";
import { saveRate, type Result } from "../actions";

// One person's fixed monthly salary.
export function RateForm({ profileId, amount }: { profileId: string; amount: number | null }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(saveRate, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="profile_id" value={profileId} />
      <label className="flex flex-col gap-1 text-sm">
        Monthly salary (₦)
        <input
          name="monthly_amount"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          required
          defaultValue={amount ?? ""}
          className="h-11 rounded-md border bg-background px-3 text-base"
        />
      </label>
      <p className="text-xs text-muted-foreground">A new amount applies to months you set after saving. Months already set keep theirs.</p>
      <div className="flex items-center gap-3">
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
