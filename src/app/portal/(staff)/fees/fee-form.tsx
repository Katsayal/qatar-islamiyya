"use client";

import { startTransition, useActionState } from "react";
import { saveFee, type Result } from "./actions";
import { controlClass } from "@/components/form-parts";
import { Check } from "lucide-react";
import { btn } from "@/components/buttons";

const input = controlClass;

export function FeeForm({
  studentId,
  termId,
  due,
  paid,
  note,
}: {
  studentId: string;
  termId: string;
  due: number;
  paid: number;
  note: string;
}) {
  const [state, formAction, pending] = useActionState<Result, FormData>(saveFee, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input type="hidden" name="student_id" value={studentId} />
      <input type="hidden" name="term_id" value={termId} />
      <label className="flex flex-col gap-1 text-sm">
        Amount due (₦)
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
