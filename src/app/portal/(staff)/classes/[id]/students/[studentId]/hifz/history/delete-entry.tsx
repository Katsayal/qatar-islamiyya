"use client";

import { startTransition, useActionState } from "react";
import { deleteHifz } from "./actions";

export function DeleteEntry({ id }: { id: string }) {
  const [error, formAction, pending] = useActionState(deleteHifz, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm("Delete this hifz entry? This cannot be undone.")) return;
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="h-9 rounded-md border border-destructive/40 px-3 text-xs font-medium text-destructive disabled:opacity-50">
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
