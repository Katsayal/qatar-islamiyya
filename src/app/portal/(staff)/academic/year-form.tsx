"use client";

import { startTransition, useActionState } from "react";
import { saveYear, type YearState } from "./actions";
import { controlClass } from "@/components/form-parts";
import { Check, Plus } from "lucide-react";
import { btn } from "@/components/buttons";

type Defaults = {
  id?: string;
  name: string;
  starts_on: string;
  term1_end: string;
  term2_end: string;
  term3_end: string;
};

const input = controlClass;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {children}
    </label>
  );
}

export function YearForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState<YearState, FormData>(saveYear, {
    ok: false,
    error: null,
  });

  // Submit without React resetting the form, so a validation error keeps what was typed.
  function keepValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  return (
    <form onSubmit={keepValues} className="grid gap-3 sm:grid-cols-2">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <Field label="Name (e.g. 2026/2027)">
        <input name="name" required defaultValue={defaults.name} className={input} />
      </Field>
      <Field label="Year starts (term 1 starts)">
        <input name="starts_on" type="date" required defaultValue={defaults.starts_on} className={input} />
      </Field>
      <Field label="Term 1 ends">
        <input name="term1_end" type="date" required defaultValue={defaults.term1_end} className={input} />
      </Field>
      <Field label="Term 2 ends">
        <input name="term2_end" type="date" required defaultValue={defaults.term2_end} className={input} />
      </Field>
      <Field label="Term 3 ends (year ends)">
        <input name="term3_end" type="date" required defaultValue={defaults.term3_end} className={input} />
      </Field>
      <div className="flex flex-col justify-end gap-2">
        {state.error && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.ok && <p role="status" className="text-sm text-primary">Saved.</p>}
        <button type="submit" disabled={pending} className={defaults.id ? btn.save : btn.create}>
          {defaults.id ? <Check aria-hidden /> : <Plus aria-hidden />} {pending ? "Saving…" : defaults.id ? "Save changes" : "Create year"}
        </button>
      </div>
    </form>
  );
}
