"use client";

import { Check, Upload } from "lucide-react";
import { startTransition, useActionState } from "react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { controlClass, Field, fileInputClass } from "@/components/form-parts";
import { saveDocument } from "./actions";

export type DocumentDefaults = { id?: string; title: string; category: string };

const input = `${controlClass} w-full`;

export function DocumentForm({ defaults }: { defaults: DocumentDefaults }) {
  const [error, formAction, pending] = useActionState(saveDocument, null);
  const editing = Boolean(defaults.id);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm"
    >
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      <Field label="Title">
        <input name="title" required maxLength={120} defaultValue={defaults.title} className={input} />
      </Field>
      <Field label="Category (optional, e.g. Timetable)">
        <input name="category" maxLength={60} defaultValue={defaults.category} className={input} />
      </Field>
      {!editing && (
        <>
          <Field label="Who can open it">
            <select name="visibility" defaultValue="general" className={input}>
              <option value="general">General: teachers &amp; staff</option>
              <option value="students">Students: shared with students (teachers &amp; staff can open it too)</option>
              <option value="vault">Vault: staff only</option>
            </select>
          </Field>
          <Field label="File">
            <input
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              className={fileInputClass}
            />
            <span className="text-xs font-normal text-muted-foreground">PDF, Word, Excel, PowerPoint or image, max 5 MB.</span>
          </Field>
        </>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {editing ? (
        <button disabled={pending} className={cn(btn.save, big)}>
          <Check aria-hidden /> {pending ? "Saving…" : "Save changes"}
        </button>
      ) : (
        <button disabled={pending} className={cn(btn.upload, big)}>
          <Upload aria-hidden /> {pending ? "Uploading…" : "Upload document"}
        </button>
      )}
    </form>
  );
}
