"use client";

import { startTransition, useActionState } from "react";
import { setTermFee, type Result } from "./actions";
import { controlClass } from "@/components/form-parts";
import { Plus } from "lucide-react";
import { btn } from "@/components/buttons";

export function TermFeeForm({ termId }: { termId: string }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(setTermFee, { ok: false, message: null });

  return (
    <details className="mt-4 rounded-xl border p-4 bg-card shadow-sm">
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
          className={`${controlClass} flex-1`}
        />
        <button disabled={pending} className={btn.create}>
          <Plus aria-hidden /> {pending ? "Creating…" : "Create records"}
        </button>
      </form>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 mt-2 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </details>
  );
}
