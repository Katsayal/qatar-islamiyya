"use client";

import { startTransition, useActionState } from "react";
import { deleteDocument } from "../../actions";

export function DeleteDocument({ id }: { id: string }) {
  const [error, formAction, pending] = useActionState(deleteDocument, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm("Delete this document and its file? This cannot be undone.")) return;
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="h-11 w-full rounded-lg border border-destructive/40 px-4 text-sm font-medium text-destructive disabled:opacity-50">
        {pending ? "Deleting…" : "Delete document"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
