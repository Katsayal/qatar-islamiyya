"use client";

import { startTransition, useActionState } from "react";
import { Field, FormSection, fileInputClass, inputClass, textareaClass } from "@/components/form-parts";
import type { ui } from "@/content/ui";
import { BLOOD_GROUPS } from "@/lib/blood-groups";
import { submitApplication, type ApplyState } from "./actions";

// t = the page language's words (ui.ts, applyForm). Option values stay the same in every language.
export function ApplicationForm({ t }: { t: (typeof ui)["en"]["applyForm"] }) {
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
        <p>{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={keepValues} className="flex flex-col gap-6">
      <FormSection step={1} title={t.programSection}>
        <Field label={t.program} className="md:col-span-2">
          <select name="program" required defaultValue="" className={inputClass}>
            <option value="" disabled>{t.chooseProgram}</option>
            <option value="tahfiz">{t.programs.tahfiz}</option>
            <option value="maahad">{t.programs.maahad}</option>
            <option value="barnamaj">{t.programs.barnamaj}</option>
          </select>
        </Field>
      </FormSection>

      <FormSection step={2} title={t.studentSection}>
        <Field label={t.fullName} className="md:col-span-2">
          <input name="full_name" required autoComplete="off" className={inputClass} />
        </Field>
        <Field label={t.gender}>
          <select name="gender" required defaultValue="" className={inputClass}>
            <option value="" disabled>{t.choose}</option>
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </select>
        </Field>
        <Field label={t.dateOfBirth}>
          <input name="date_of_birth" type="date" required className={inputClass} />
        </Field>
        <Field label={t.bloodGroup}>
          <select name="blood_group" required defaultValue="" className={inputClass}>
            <option value="" disabled>{t.chooseBloodGroup}</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g === "Unknown" ? t.bloodUnknown : g}</option>
            ))}
          </select>
        </Field>
        <Field label={t.level}>
          <select name="entry_level" defaultValue="" className={inputClass}>
            <option value="">{t.notSure}</option>
            <option value="hadda">{t.hadda}</option>
            <option value="sauka">{t.sauka}</option>
          </select>
        </Field>
        <Field label={t.address} className="md:col-span-2">
          <input name="address" required className={inputClass} />
        </Field>
        <Field label={t.localGovernment}>
          <input name="local_government" required className={inputClass} />
        </Field>
        <Field label={t.previousIslamiyya}>
          <input name="previous_islamiyya" required className={inputClass} />
        </Field>
        <Field label={t.studentPhone} className="md:col-span-2">
          <input name="student_phone" type="tel" autoComplete="off" className={inputClass} />
        </Field>
        <Field label={t.photo} className="md:col-span-2">
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className={fileInputClass} />
        </Field>
      </FormSection>

      <FormSection step={3} title={t.guardianSection}>
        <Field label={t.guardianName}>
          <input name="guardian_name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label={t.guardianPhone}>
          <input name="guardian_phone" type="tel" required autoComplete="tel" className={inputClass} />
        </Field>
        <Field label={t.guardianAddress}>
          <input name="guardian_address" className={inputClass} />
        </Field>
        <Field label={t.guardianLocalGovernment}>
          <input name="guardian_local_government" className={inputClass} />
        </Field>
        <Field label={t.medical} className="md:col-span-2">
          <textarea name="medical_notes" rows={2} className={textareaClass} />
        </Field>
        <Field label={t.notes} className="md:col-span-2">
          <textarea name="notes" rows={2} className={textareaClass} />
        </Field>
      </FormSection>

      {/* Honeypot: hidden from people, filled by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <label className="flex items-start gap-3 rounded-lg border bg-secondary p-4 text-sm">
        <input name="consent" type="checkbox" required className="mt-0.5 size-5 accent-primary" />
        <span>{t.consent}</span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {t.errors[state.error]}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}
