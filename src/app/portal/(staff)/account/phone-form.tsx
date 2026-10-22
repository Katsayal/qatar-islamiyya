"use client";

import { Check } from "lucide-react";
import { startTransition, useActionState } from "react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { controlClass } from "@/components/form-parts";
import type { PasswordResult } from "./actions";

// "My phone number" for the signed-in teacher, staff member or owner. Empty box + Save removes the number.
export function PhoneForm({
  action,
  phone,
}: {
  action: (prev: PasswordResult, formData: FormData) => Promise<PasswordResult>;
  phone: string;
}) {
  const [result, formAction, pending] = useActionState(action, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        Phone number (e.g. 08012345678)
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={phone} maxLength={20} className={controlClass} />
      </label>
      {result && (
        <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending} className={cn(btn.save, big)}>
        <Check aria-hidden /> {pending ? "Saving…" : "Save phone number"}
      </button>
    </form>
  );
}
