"use client";

import { startTransition, useActionState } from "react";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { deletePhoto, saveCaption } from "./actions";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { controlClass, Field } from "@/components/form-parts";

export function CaptionForm({ id, caption }: { id: string; caption: string }) {
  const [result, formAction, pending] = useActionState(saveCaption, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <Field label="Caption">
        <input name="caption" maxLength={150} defaultValue={caption} dir="auto" className={`${controlClass} w-full`} />
      </Field>
      {result && (
        <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending} className={cn(btn.save, big)}>
        <Check aria-hidden /> {pending ? "Saving…" : "Save caption"}
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
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit ask="Delete this photo? This cannot be undone." yes="Yes, delete" disabled={pending} className={`${btn.danger} w-full`}>
        <Trash2 aria-hidden /> {pending ? "Deleting…" : "Delete photo"}
      </ConfirmSubmit>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
