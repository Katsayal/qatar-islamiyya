"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { BLOOD_GROUPS } from "@/lib/blood-groups";
import { saveStudent } from "./actions";

export type StudentDefaults = Record<
  | "admission_no" | "full_name" | "full_name_ar" | "gender" | "date_of_birth" | "admitted_on"
  | "class_id" | "status" | "address" | "local_government" | "previous_islamiyya" | "blood_group" | "student_phone"
  | "entry_level" | "medical_notes" | "notes" | "guardian_name" | "guardian_phone" | "guardian_address"
  | "guardian_local_government",
  string
> & { id?: string; photoUrl?: string | null };

type ClassOption = { id: string; name: string; program: string };

const input = "h-11 rounded-md border bg-background px-3 text-base";
const programLabels: Record<string, string> = { tahfiz: "Tahfiz", maahad: "Ma'ahad", barnamaj: "Barnamaj" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {children}
    </label>
  );
}

export function StudentForm({ defaults: d, classes }: { defaults: StudentDefaults; classes: ClassOption[] }) {
  const [error, formAction, pending] = useActionState(saveStudent, null);

  // Submit without React resetting the form, so an error keeps what was typed.
  function keepValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  const text = (name: keyof StudentDefaults, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label}>
      <input name={name} defaultValue={d[name] as string} className={input} {...extra} />
    </Field>
  );

  return (
    <form onSubmit={keepValues} className="flex flex-col gap-4">
      {d.id && <input type="hidden" name="id" value={d.id} />}

      <h2 className="font-semibold">Student</h2>
      {text("admission_no", "Admission number *", { required: true, autoCapitalize: "characters" })}
      {text("full_name", "Full name *", { required: true })}
      <Field label="Arabic name">
        <input name="full_name_ar" lang="ar" dir="rtl" defaultValue={d.full_name_ar} className={`font-arabic ${input}`} />
      </Field>
      <Field label="Gender *">
        <select name="gender" required defaultValue={d.gender} className={input}>
          <option value="" disabled>Choose</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </Field>
      {text("date_of_birth", "Date of birth *", { type: "date", required: true })}
      <Field label="Blood group *">
        <select name="blood_group" required defaultValue={d.blood_group} className={input}>
          <option value="" disabled>Choose</option>
          {BLOOD_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </Field>
      <Field label="Class">
        <select name="class_id" defaultValue={d.class_id} className={input}>
          <option value="">No class yet</option>
          {Object.keys(programLabels).map((p) => (
            <optgroup key={p} label={programLabels[p]}>
              {classes.filter((c) => c.program === p).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      {text("admitted_on", "Admitted on", { type: "date" })}
      {d.id && (
        <Field label="Status">
          <select name="status" defaultValue={d.status} className={input}>
            {["active", "graduated", "withdrawn", "archived"].map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </Field>
      )}
      {text("address", "Address *", { required: true })}
      {text("local_government", "Local government *", { required: true })}
      {text("previous_islamiyya", "Previous Islamiyya *", { required: true })}
      {text("student_phone", "Student phone (optional, e.g. 08012345678)", { type: "tel" })}
      <Field label="Level of study">
        <select name="entry_level" defaultValue={d.entry_level} className={input}>
          <option value="">Not set</option>
          <option value="hadda">Hadda (has memorised the Qur&apos;an)</option>
          <option value="sauka">Sauka (has completed Qur&apos;an reading)</option>
        </select>
      </Field>
      <Field label="Medical condition, if any (larura)">
        <textarea name="medical_notes" rows={2} defaultValue={d.medical_notes} className={`py-2 ${input} h-auto`} />
      </Field>
      <Field label="Special notes">
        <textarea name="notes" rows={2} defaultValue={d.notes} className={`py-2 ${input} h-auto`} />
      </Field>

      <Field label="Photo (JPG, PNG or WebP, max 2 MB)">
        {d.photoUrl && (
          // Private signed URL: a plain <img> keeps it out of the image optimizer cache.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.photoUrl} alt="Current photo" className="size-24 rounded-lg object-cover" />
        )}
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
      </Field>

      <h2 className="mt-2 font-semibold">Parent / guardian</h2>
      {text("guardian_name", "Name")}
      {text("guardian_phone", "Phone (e.g. 08012345678)", { type: "tel" })}
      {text("guardian_address", "Address")}
      {text("guardian_local_government", "Local government")}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Saving…" : "Save student"}
      </Button>
    </form>
  );
}
