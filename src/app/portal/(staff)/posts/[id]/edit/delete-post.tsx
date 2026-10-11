"use client";

import { startTransition, useActionState } from "react";
import { deletePost } from "../../actions";

export function DeletePost({ id }: { id: string }) {
  const [error, formAction, pending] = useActionState(deletePost, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!window.confirm("Delete this post? This cannot be undone.")) return;
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="h-11 w-full rounded-lg border border-destructive/40 px-4 text-sm font-medium text-destructive disabled:opacity-50">
        {pending ? "Deleting…" : "Delete post"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
