"use client";

import { startTransition, useActionState } from "react";
import { acceptApplication } from "../actions";
import { controlClass } from "@/components/form-parts";
import { UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";

const input = controlClass;

export function AcceptForm({
  id,
  classes,
  today,
  term,
  termFee,
}: {
  id: string;
  classes: { id: string; name: string }[];
  today: string;
  term: string | null; // label of the current term, or null if none
  termFee: number;
}) {
  const [error, formAction, pending] = useActionState(acceptApplication, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <label className="flex flex-col gap-1 text-sm">
        Admission number *
        <input name="admission_no" required autoComplete="off" autoCapitalize="characters" className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Class
        <select name="class_id" defaultValue="" className={input}>
          <option value="">No class yet</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Admitted on
        <input name="admitted_on" type="date" required defaultValue={today} className={input} />
      </label>
      <div className="mt-1 flex flex-col gap-3 rounded-lg border p-3 bg-card">
        <p className="text-sm font-medium">Payment</p>
        <label className="flex items-start gap-2 text-sm">
          <input name="form_fee_received" type="checkbox" required className="mt-1 size-4" />
          <span>The ₦2,000 application form fee has been received. *</span>
        </label>
        {term ? (
          <>
            <p className="text-sm text-muted-foreground">Term school fee record for {term}:</p>
            <label className="flex flex-col gap-1 text-sm">
              Amount due (₦)
              <input name="fee_due" type="number" min={0} step={1} inputMode="numeric" defaultValue={termFee} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Paid so far (₦)
              <input name="fee_paid" type="number" min={0} step={1} inputMode="numeric" defaultValue={0} className={input} />
            </label>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            There is no current term, so no term fee record is created. Set up the academic year first.
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={cn(btn.save, big)}>
        <UserCheck aria-hidden /> {pending ? "Creating student…" : "Accept and create student"}
      </button>
    </form>
  );
}
