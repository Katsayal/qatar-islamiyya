"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { submitApplication, type ApplyState } from "./actions";

const input = "h-11 rounded-md border bg-background px-3 text-base";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {children}
    </label>
  );
}

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(submitApplication, {
    ok: false,
    error: null,
  });

  // Submit without React resetting the form, so a validation error keeps what was typed.
  function keepValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  if (state.ok) {
    return (
      <p role="status" className="rounded-lg border bg-muted p-4">
        JazakAllahu khayran. Your application has been received. The school will contact the
        guardian by phone.
      </p>
    );
  }

  return (
    <form onSubmit={keepValues} className="flex flex-col gap-4">
      <Field label="Program *">
        <select name="program" required defaultValue="" className={input}>
          <option value="" disabled>Choose a program</option>
          <option value="tahfiz">Tahfiz</option>
          <option value="maahad">Ma&apos;ahad</option>
          <option value="barnamaj">Barnamaj</option>
        </select>
      </Field>

      <h3 className="mt-2 font-semibold">Student</h3>
      <Field label="Full name *">
        <input name="full_name" required autoComplete="off" className={input} />
      </Field>
      <Field label="Gender *">
        <select name="gender" required defaultValue="" className={input}>
          <option value="" disabled>Choose</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </Field>
      <Field label="Date of birth">
        <input name="date_of_birth" type="date" className={input} />
      </Field>
      <Field label="Address">
        <input name="address" className={input} />
      </Field>
      <Field label="Town">
        <input name="town" className={input} />
      </Field>
      <Field label="Previous school">
        <input name="previous_school" className={input} />
      </Field>
      <Field label="Level of study">
        <select name="entry_level" defaultValue="" className={input}>
          <option value="">Not sure</option>
          <option value="hadda">Hadda (has memorised the Qur&apos;an)</option>
          <option value="sauka">Sauka (has completed Qur&apos;an reading)</option>
        </select>
      </Field>
      <Field label="Passport photo (JPG, PNG or WebP, max 2 MB)">
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
      </Field>

      <h3 className="mt-2 font-semibold">Parent / guardian</h3>
      <Field label="Name *">
        <input name="guardian_name" required autoComplete="name" className={input} />
      </Field>
      <Field label="Phone number * (e.g. 08012345678)">
        <input name="guardian_phone" type="tel" required autoComplete="tel" className={input} />
      </Field>
      <Field label="Address">
        <input name="guardian_address" className={input} />
      </Field>
      <Field label="Town">
        <input name="guardian_town" className={input} />
      </Field>
      <Field label="Medical condition, if any (larura)">
        <textarea name="medical_notes" rows={2} className={`py-2 ${input} h-auto`} />
      </Field>
      <Field label="Other notes">
        <textarea name="notes" rows={2} className={`py-2 ${input} h-auto`} />
      </Field>

      {/* Honeypot: hidden from people, filled by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <label className="flex items-start gap-2 text-sm">
        <input name="consent" type="checkbox" required className="mt-1 size-4" />
        <span>
          I agree that the school may store this information to process the application, in line
          with the Nigeria Data Protection Act 2023. *
        </span>
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Sending…" : "Send application"}
      </Button>
    </form>
  );
}
