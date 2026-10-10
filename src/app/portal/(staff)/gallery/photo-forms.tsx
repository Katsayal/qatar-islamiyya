"use client";

import { startTransition, useActionState } from "react";
import { deletePhoto, saveCaption } from "./actions";

export function CaptionForm({ id, caption }: { id: string; caption: string }) {
  const [error, formAction, pending] = useActionState(saveCaption, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <label className="flex flex-col gap-1 text-sm">
        Caption
        <input name="caption" maxLength={150} defaultValue={caption} className="h-11 rounded-md border bg-background px-3 text-base" />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-md bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Saving…" : "Save caption"}
      </button>
    </form>
  );
}

export function DeletePhoto({ id }: { id: string }) {
  const [error, formAction, pending] = useActionState(deletePhoto, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm("Delete this photo? This cannot be undone.")) return;
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="h-11 w-full rounded-md border border-destructive/40 px-4 text-sm font-medium text-destructive disabled:opacity-50">
        {pending ? "Deleting…" : "Delete photo"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
