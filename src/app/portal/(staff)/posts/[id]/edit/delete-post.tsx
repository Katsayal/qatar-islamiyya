"use client";

import { Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { startTransition, useActionState } from "react";
import { btn } from "@/components/buttons";
import { deletePost } from "../../actions";

export function DeletePost({ id }: { id: string }) {
  const [error, formAction, pending] = useActionState(deletePost, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit ask="Delete this post? This cannot be undone." yes="Yes, delete" disabled={pending} className={`${btn.danger} w-full`}>
        <Trash2 aria-hidden /> {pending ? "Deleting…" : "Delete post"}
      </ConfirmSubmit>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
