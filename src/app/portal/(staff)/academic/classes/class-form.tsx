"use client";

import { startTransition, useActionState } from "react";
import { saveClass } from "./actions";
import { controlClass } from "@/components/form-parts";
import { TeacherPicker, type Person } from "./teacher-picker";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";

export type ClassDefaults = {
  id?: string;
  name: string;
  name_ar: string;
  program: string;
  level: string;
  hifz_unit: string;
  sort_order: string;
  active: boolean;
  teacher_ids: string[];
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

export function ClassForm({
  defaults,
  teachers,
}: {
  defaults: ClassDefaults;
  teachers: Person[];
}) {
  const [error, formAction, pending] = useActionState(saveClass, null);

  // Submit without React resetting the form, so a validation error keeps what was typed.
  function keepValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  return (
    <form onSubmit={keepValues} className="flex flex-col gap-4">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <Field label="Name (e.g. qari name, halqa name or Barnamaj)">
        <input name="name" required defaultValue={defaults.name} className={input} />
      </Field>
      <Field label="Arabic name (optional)">
        <input name="name_ar" lang="ar" dir="rtl" defaultValue={defaults.name_ar} className={`font-arabic ${input}`} />
      </Field>
      <Field label="Program">
        <select name="program" required defaultValue={defaults.program} className={input}>
          <option value="tahfiz">Tahfiz</option>
          <option value="maahad">Ma&apos;ahad</option>
          <option value="barnamaj">Barnamaj</option>
        </select>
      </Field>
      <Field label="Level (Tahfiz only, 1 to 5+)">
        <input name="level" type="number" min={1} max={20} defaultValue={defaults.level} className={input} />
      </Field>
      <Field label="Hifz unit (Tahfiz only; Ma'ahad is always pages)">
        <select name="hifz_unit" defaultValue={defaults.hifz_unit} className={input}>
          <option value="">Not set</option>
          <option value="lines">Lines</option>
          <option value="pages">Pages</option>
        </select>
      </Field>
      <Field label="Position in lists">
        <input name="sort_order" type="number" min={0} defaultValue={defaults.sort_order} className={input} />
        <span className="text-xs text-muted-foreground">
          Where this class appears in class lists and menus: smaller numbers come first (1, 2, 3…). Classes with
          the same number are sorted by name.
        </span>
      </Field>

      <TeacherPicker people={teachers} initial={defaults.teacher_ids} />

      <label className="flex h-10 items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={defaults.active} className="size-4" />
        Active (untick to hide a class that is no longer used)
      </label>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={cn(btn.save, big)}>
        <Check aria-hidden /> {pending ? "Saving…" : "Save class"}
      </button>
    </form>
  );
}
