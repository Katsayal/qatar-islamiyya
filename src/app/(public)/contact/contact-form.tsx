"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { sendMessage, type ContactState } from "./actions";

const field = "rounded-md border bg-background px-3 text-base";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendMessage, {
    ok: false,
    error: null,
  });

  if (state.ok) {
    return (
      <p role="status" className="rounded-lg border bg-muted p-4">
        JazakAllahu khayran. Your message has been sent and we will get back to you.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input name="name" required autoComplete="name" className={`h-11 ${field}`} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone (optional)
        <input name="phone" type="tel" autoComplete="tel" className={`h-11 ${field}`} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Message
        <textarea name="message" required rows={5} className={`py-2 ${field}`} />
      </label>
      {/* Honeypot: hidden from people, filled by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
