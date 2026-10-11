"use client";

import { startTransition, useActionState } from "react";
import { Field, inputClass } from "@/components/form-parts";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, null);

  // Submit without React resetting the form, so a wrong password keeps the login typed.
  function keepValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  return (
    <form onSubmit={keepValues} className="flex flex-col gap-4">
      <Field label="Email or admission number">
        <input
          name="login"
          required
          autoComplete="username"
          autoCapitalize="none"
          className={inputClass}
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
