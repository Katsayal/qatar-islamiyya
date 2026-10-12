"use client";

import { startTransition, useActionState } from "react";
import { deleteHifz } from "./actions";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/buttons";

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
      <button disabled={pending} aria-label="Delete this entry" className={cn(btn.danger, "h-9 px-3 text-xs")}>
        <Trash2 aria-hidden /> {pending ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
