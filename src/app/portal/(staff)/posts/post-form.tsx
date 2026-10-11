"use client";

import { startTransition, useActionState } from "react";
import { savePost } from "./actions";
import { controlClass } from "@/components/form-parts";

export type PostDefaults = {
  id?: string;
  title: string;
  body: string;
  lang: string;
  audience: string;
  published: boolean;
  hasCover: boolean;
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

export function PostForm({ defaults }: { defaults: PostDefaults }) {
  const [error, formAction, pending] = useActionState(savePost, null);

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
        <input name="title" required maxLength={150} defaultValue={defaults.title} className={input} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Who can read it">
          <select name="audience" defaultValue={defaults.audience} className={input}>
            <option value="public">Public (website)</option>
            <option value="internal">Teachers &amp; staff</option>
            <option value="students">Students</option>
          </select>
        </Field>
        <Field label="Language">
          <select name="lang" defaultValue={defaults.lang} className={input}>
            <option value="en">English</option>
            <option value="ha">Hausa</option>
            <option value="ar">Arabic</option>
          </select>
        </Field>
      </div>
      <Field label="Text">
        <textarea name="body" rows={12} defaultValue={defaults.body} className={`${controlClass} h-auto p-3 text-base`} />
        <span className="text-xs text-muted-foreground">
          Markdown: **bold**, *italic*, # Heading, - list item, [link text](https://…). A blank line starts a new paragraph.
        </span>
      </Field>
      <Field label={defaults.hasCover ? "Replace cover image (optional)" : "Cover image (optional)"}>
        <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
        <span className="text-xs text-muted-foreground">JPG, PNG or WebP, max 2 MB.</span>
      </Field>
      {defaults.hasCover && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remove_cover" className="size-4" />
          Remove the current cover
        </label>
      )}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="publish" defaultChecked={defaults.published} className="size-4" />
        Published (untick to keep as a draft)
      </label>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
        {pending ? "Saving…" : "Save post"}
      </button>
    </form>
  );
}
