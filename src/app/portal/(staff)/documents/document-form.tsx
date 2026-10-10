"use client";

import { startTransition, useActionState } from "react";
import { saveDocument } from "./actions";

export type DocumentDefaults = { id?: string; title: string; category: string };

const input = "h-11 rounded-md border bg-background px-3 text-base";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {children}
    </label>
  );
}

export function DocumentForm({ defaults }: { defaults: DocumentDefaults }) {
  const [error, formAction, pending] = useActionState(saveDocument, null);
  const editing = Boolean(defaults.id);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-4"
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
              <option value="vault">Vault: staff only</option>
            </select>
          </Field>
          <Field label="File">
            <input
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              className="text-sm"
            />
            <span className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint or image, max 5 MB.</span>
          </Field>
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-md bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">
        {pending ? (editing ? "Saving…" : "Uploading…") : editing ? "Save changes" : "Upload document"}
      </button>
    </form>
  );
}
