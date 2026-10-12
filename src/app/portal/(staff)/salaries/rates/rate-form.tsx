"use client";

import { startTransition, useActionState } from "react";
import { saveRate, type Result } from "../actions";
import { controlClass } from "@/components/form-parts";
import { Check } from "lucide-react";
import { btn } from "@/components/buttons";

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
          className={controlClass}
        />
      </label>
      <p className="text-xs text-muted-foreground">A new amount applies to months you set after saving. Months already set keep theirs.</p>
      <div className="flex items-center gap-3">
        <button disabled={pending} className={btn.save}>
          <Check aria-hidden /> {pending ? "Saving…" : "Save"}
        </button>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
