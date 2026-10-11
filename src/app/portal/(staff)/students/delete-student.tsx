"use client";

import { startTransition, useActionState } from "react";
import { deleteStudent } from "./actions";
import { controlClass } from "@/components/form-parts";

export function DeleteStudent({ id, admissionNo }: { id: string; admissionNo: string }) {
  const [error, formAction, pending] = useActionState(deleteStudent, null);

  return (
    <details className="rounded-xl border border-destructive/40 p-4">
      <summary className="cursor-pointer text-sm font-medium text-destructive">Delete student…</summary>
      <p className="mt-3 text-sm text-muted-foreground">
        This permanently deletes the student and all their hifz, attendance, exam, comment and fee
        records. To just remove them from lists, use <strong>Archive</strong> instead. To confirm,
        type the admission number <strong>{admissionNo}</strong>.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(() => formAction(new FormData(e.currentTarget)));
        }}
        className="mt-3 flex flex-col gap-3"
      >
        <input type="hidden" name="id" value={id} />
        <input name="confirm" required autoComplete="off" placeholder={admissionNo} className={controlClass} />
        {error && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <button disabled={pending} className="h-11 rounded-lg bg-destructive px-4 text-sm font-medium text-white disabled:opacity-50">
          {pending ? "Deleting…" : "Delete permanently"}
        </button>
      </form>
    </details>
  );
}
