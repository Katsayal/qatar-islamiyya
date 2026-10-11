"use client";

import { startTransition, useActionState } from "react";
import { deletePhoto, saveCaption } from "./actions";
import { controlClass } from "@/components/form-parts";

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
        <input name="caption" maxLength={150} defaultValue={caption} className={controlClass} />
      </label>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
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
      <button disabled={pending} className="h-11 w-full rounded-lg border border-destructive/40 px-4 text-sm font-medium text-destructive disabled:opacity-50">
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
