"use client";

import { startTransition, useActionState } from "react";
import { saveBank } from "./actions";

const input = "h-11 rounded-md border bg-background px-3 text-base";

export function BankForm({ defaults }: { defaults: { bank_name: string; account_name: string; account_number: string } }) {
  const [result, formAction, pending] = useActionState(saveBank, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        Bank
        <input name="bank_name" maxLength={80} defaultValue={defaults.bank_name} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Account name
        <input name="account_name" maxLength={120} defaultValue={defaults.account_name} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Account number (10 digits)
        <input name="account_number" inputMode="numeric" maxLength={10} defaultValue={defaults.account_number} className={input} />
      </label>
      <p className="text-xs text-muted-foreground">Shown on the public Admissions page. Leave the account number empty to show &ldquo;announced soon&rdquo;.</p>
      {result && (
        <p role="alert" className={`text-sm ${result.ok ? "text-primary" : "text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending} className="h-12 rounded-md bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Saving…" : "Save bank details"}
      </button>
    </form>
  );
}
