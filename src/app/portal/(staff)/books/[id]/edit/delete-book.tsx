"use client";

import { startTransition, useActionState } from "react";
import { deleteBook } from "../../actions";
import { Trash2 } from "lucide-react";
import { btn } from "@/components/buttons";

export function DeleteBook({ id }: { id: string }) {
  const [error, formAction, pending] = useActionState(deleteBook, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm("Delete this book? This cannot be undone.")) return;
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className={`${btn.danger} w-full`}>
        <Trash2 aria-hidden /> {pending ? "Deleting…" : "Delete book"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
