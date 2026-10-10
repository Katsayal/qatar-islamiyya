"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { requestCorrection } from "./actions";

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
          className="rounded-md border bg-background px-3 py-2 text-base"
        />
      </label>
      {result && (
        <p role="alert" className={`text-sm ${result.ok ? "text-primary" : "text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-md bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
