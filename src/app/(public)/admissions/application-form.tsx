"use client";

import { startTransition, useActionState } from "react";
import { Field, FormSection, inputClass, textareaClass } from "@/components/form-parts";
import { BLOOD_GROUPS } from "@/lib/blood-groups";
import { submitApplication, type ApplyState } from "./actions";

const fileClass =
  "w-full rounded-lg border border-input bg-white p-2 text-sm file:me-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-medium file:text-primary";

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
      <div role="status" className="flex items-start gap-4 rounded-xl border border-primary/30 bg-secondary p-6">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
          ✓
        </span>
        <p>
          JazakAllahu khayran. Your application has been received. The school will contact the
          guardian by phone.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={keepValues} className="flex flex-col gap-6">
      <FormSection step={1} title="Program">
        <Field label="Program *" className="md:col-span-2">
          <select name="program" required defaultValue="" className={inputClass}>
            <option value="" disabled>Choose a program</option>
            <option value="tahfiz">Tahfiz</option>
            <option value="maahad">Ma&apos;ahad</option>
            <option value="barnamaj">Barnamaj</option>
          </select>
        </Field>
      </FormSection>

      <FormSection step={2} title="Student">
        <Field label="Full name *" className="md:col-span-2">
          <input name="full_name" required autoComplete="off" className={inputClass} />
        </Field>
        <Field label="Gender *">
          <select name="gender" required defaultValue="" className={inputClass}>
            <option value="" disabled>Choose</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Date of birth *">
          <input name="date_of_birth" type="date" required className={inputClass} />
        </Field>
        <Field label="Blood group *">
          <select name="blood_group" required defaultValue="" className={inputClass}>
            <option value="" disabled>Choose (or Unknown)</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
        <Field label="Level of study">
          <select name="entry_level" defaultValue="" className={inputClass}>
            <option value="">Not sure</option>
            <option value="hadda">Hadda (has memorised the Qur&apos;an)</option>
            <option value="sauka">Sauka (has completed Qur&apos;an reading)</option>
          </select>
        </Field>
        <Field label="Address *" className="md:col-span-2">
          <input name="address" required className={inputClass} />
        </Field>
        <Field label="Local government *">
          <input name="local_government" required className={inputClass} />
        </Field>
        <Field label="Previous Islamiyya *">
          <input name="previous_islamiyya" required className={inputClass} />
        </Field>
        <Field label="Student's phone number (optional, if the student has one)" className="md:col-span-2">
          <input name="student_phone" type="tel" autoComplete="off" className={inputClass} />
        </Field>
        <Field label="Passport photo (JPG, PNG or WebP, max 2 MB)" className="md:col-span-2">
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className={fileClass} />
        </Field>
      </FormSection>

      <FormSection step={3} title="Parent / guardian">
        <Field label="Name *">
          <input name="guardian_name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Phone number * (e.g. 08012345678)">
          <input name="guardian_phone" type="tel" required autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Address">
          <input name="guardian_address" className={inputClass} />
        </Field>
        <Field label="Local government">
          <input name="guardian_local_government" className={inputClass} />
        </Field>
        <Field label="Medical condition, if any (larura)" className="md:col-span-2">
          <textarea name="medical_notes" rows={2} className={textareaClass} />
        </Field>
        <Field label="Other notes" className="md:col-span-2">
          <textarea name="notes" rows={2} className={textareaClass} />
        </Field>
      </FormSection>

      {/* Honeypot: hidden from people, filled by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <label className="flex items-start gap-3 rounded-lg border bg-secondary p-4 text-sm">
        <input name="consent" type="checkbox" required className="mt-0.5 size-5 accent-primary" />
        <span>
          I agree that the school may store this information to process the application, in line
          with the Nigeria Data Protection Act 2023. *
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
