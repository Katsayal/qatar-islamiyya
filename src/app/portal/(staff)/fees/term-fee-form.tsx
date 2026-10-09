"use client";

import { startTransition, useActionState } from "react";
import { setTermFee, type Result } from "./actions";

export function TermFeeForm({ termId }: { termId: string }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(setTermFee, { ok: false, message: null });

  return (
    <details className="mt-4 rounded-lg border p-4">
      <summary className="cursor-pointer text-sm font-medium">Set the fee for everyone…</summary>
      <p className="mt-2 text-sm text-muted-foreground">
        Creates an unpaid record for every active student who has none for this term. Existing records are not changed.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(() => formAction(new FormData(e.currentTarget)));
        }}
        className="mt-3 flex flex-col gap-3 sm:flex-row"
      >
        <input type="hidden" name="term_id" value={termId} />
        <input
          name="amount_due"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          required
          placeholder="Amount due (₦)"
          className="h-11 flex-1 rounded-md border bg-background px-3 text-base"
        />
        <button disabled={pending} className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {pending ? "Creating…" : "Create records"}
        </button>
      </form>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`mt-2 text-sm ${state.ok ? "text-primary" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </details>
  );
}
