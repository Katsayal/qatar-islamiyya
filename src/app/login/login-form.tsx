"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Email or admission number
        <input
          name="login"
          required
          autoComplete="username"
          autoCapitalize="none"
          className="h-11 rounded-md border bg-background px-3 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 rounded-md border bg-background px-3 text-base"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
