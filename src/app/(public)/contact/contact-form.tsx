"use client";

import { startTransition, useActionState } from "react";
import { Field, inputClass, textareaClass } from "@/components/form-parts";
import { sendMessage, type ContactState } from "./actions";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendMessage, {
    ok: false,
    error: null,
  });

  // Submit without React resetting the form, so a validation error keeps what was typed.
  function keepValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  if (state.ok) {
    return (
      <div role="status" className="flex items-start gap-4 rounded-xl border border-primary/30 bg-secondary p-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
          ✓
        </span>
        <p>JazakAllahu khayran. Your message has been sent and we will get back to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={keepValues} className="flex flex-col gap-4">
      <Field label="Your name">
        <input name="name" required autoComplete="name" className={inputClass} />
      </Field>
      <Field label="Phone (optional)">
        <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </Field>
      <Field label="Message">
        <textarea name="message" required rows={5} className={textareaClass} />
      </Field>
      {/* Honeypot: hidden from people, filled by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
