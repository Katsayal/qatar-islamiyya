"use client";

import { KeyRound } from "lucide-react";
import { startTransition, useActionState } from "react";
import { btn } from "@/components/buttons";
import { createStudentLoginsBatch } from "./actions";
import { controlClass } from "@/components/form-parts";

// One password box + one button for the next batch of students without a login.
export function BulkLoginForm({ batch, remaining }: { batch: number; remaining: number }) {
  const [result, formAction, pending] = useActionState(createStudentLoginsBatch, null);
  const next = Math.min(batch, remaining);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-2"
    >
      <input
        name="password"
        required
        minLength={6}
        autoComplete="off"
        placeholder="Enter the password"
        className={controlClass}
      />
      <button disabled={pending} className={btn.security}>
        <KeyRound aria-hidden />{" "}
        {pending ? "Creating logins… please wait" : `Create logins for the next ${next} student${next === 1 ? "" : "s"}`}
      </button>
      {result && (
        <div role={result.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          <p>{result.message}</p>
          {result.failures.length > 0 && (
            <ul className="mt-1 list-disc ps-5">
              {result.failures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
