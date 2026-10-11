"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { requestCorrection } from "./actions";
import { controlClass } from "@/components/form-parts";

export function CorrectionForm() {
  const [result, formAction, pending] = useActionState(requestCorrection, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the text after a successful send; after an error it stays so the student can fix it.
  useEffect(() => {
    if (result?.ok) formRef.current?.reset();
  }, [result]);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(async () => {
          await formAction(data);
        });
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        What should be corrected?
        <textarea
          name="message"
          rows={4}
          maxLength={500}
          required
          className={`${controlClass} h-auto px-3 py-2 text-base`}
        />
      </label>
      {result && (
        <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
