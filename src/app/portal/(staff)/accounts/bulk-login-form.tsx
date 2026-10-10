"use client";

import { startTransition, useActionState } from "react";
import { createStudentLoginsBatch } from "./actions";

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
        className="h-11 rounded-md border bg-background px-3 text-base"
      />
      <button disabled={pending} className="h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Creating logins… please wait" : `Create logins for the next ${next} student${next === 1 ? "" : "s"}`}
      </button>
      {result && (
        <div role={result.ok ? "status" : "alert"} className={`text-sm ${result.ok ? "text-primary" : "text-destructive"}`}>
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
