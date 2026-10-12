"use client";

import { startTransition, useActionState } from "react";
import { deleteYear } from "./actions";

export function DeleteYear({ id, name }: { id: string; name: string }) {
  const [state, formAction, pending] = useActionState(deleteYear, { ok: false, error: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm(`Delete the academic year ${name} and its three terms? This cannot be undone.`)) return;
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="mt-4 border-t pt-4"
    >
      <input type="hidden" name="id" value={id} />
      <button
        disabled={pending}
        className="h-11 w-full rounded-lg border border-destructive/40 px-4 text-sm font-medium text-destructive disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete this year"}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">Only possible while nothing has been recorded in this year.</p>
      {state.error && (
        <p role="alert" className="mt-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
