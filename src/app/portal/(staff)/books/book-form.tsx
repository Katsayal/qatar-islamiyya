"use client";

import { startTransition, useActionState } from "react";
import { saveBook } from "./actions";
import { controlClass } from "@/components/form-parts";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";

export type BookDefaults = {
  id?: string;
  term_number: string;
  subject: string;
  title: string;
  author: string;
  study_type: string;
  teacher_id: string;
  started_on: string;
  finished_on: string;
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

export function BookForm({ defaults, teachers }: { defaults: BookDefaults; teachers: { id: string; full_name: string }[] }) {
  const [error, formAction, pending] = useActionState(saveBook, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-4"
    >
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <Field label="Term">
        <select name="term_number" required defaultValue={defaults.term_number} className={input}>
          <option value="1">Term 1</option>
          <option value="2">Term 2</option>
          <option value="3">Term 3</option>
        </select>
      </Field>
      <Field label="Subject (الفن)">
        <input name="subject" required lang="ar" dir="rtl" defaultValue={defaults.subject} className={`font-arabic ${input}`} />
      </Field>
      <Field label="Book title">
        <input name="title" required lang="ar" dir="rtl" defaultValue={defaults.title} className={`font-arabic ${input}`} />
      </Field>
      <Field label="Author (optional)">
        <input name="author" lang="ar" dir="rtl" defaultValue={defaults.author} className={`font-arabic ${input}`} />
      </Field>
      <Field label="Reading type">
        <select name="study_type" defaultValue={defaults.study_type} className={input}>
          <option value="">Not set</option>
          <option value="hifz">حفظ (memorise)</option>
          <option value="istizhar">استظهار (recite)</option>
          <option value="sharh">شرح (explain)</option>
        </select>
      </Field>
      <Field label="Teacher">
        <select name="teacher_id" defaultValue={defaults.teacher_id} className={input}>
          <option value="">Not assigned</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.full_name}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starting on">
          <input name="started_on" type="date" defaultValue={defaults.started_on} className={input} />
        </Field>
        <Field label="Finishing on">
          <input name="finished_on" type="date" defaultValue={defaults.finished_on} className={input} />
        </Field>
      </div>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <button disabled={pending} className={cn(btn.save, big)}>
        <Check aria-hidden /> {pending ? "Saving…" : "Save book"}
      </button>
    </form>
  );
}
