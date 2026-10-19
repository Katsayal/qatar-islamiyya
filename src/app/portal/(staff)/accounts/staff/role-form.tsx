"use client";

import { startTransition, useActionState, useState } from "react";
import { UserCog } from "lucide-react";
import { btn } from "@/components/buttons";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { controlClass } from "@/components/form-parts";
import { changeRole, type Result } from "../actions";

const labels = { teacher: "Teacher", staff: "Staff", owner: "Owner" } as const;
type RoleKey = keyof typeof labels;

// Owner only: Teacher · Staff · Owner for someone else's account (the server checks this too).
export function RoleForm({ userId, name, current }: { userId: string; name: string; current: RoleKey }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(changeRole, { ok: false, message: null });
  const [role, setRole] = useState<RoleKey>(current);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value as RoleKey)}
        aria-label={`Role of ${name}`}
        className={controlClass}
      >
        {(Object.keys(labels) as RoleKey[]).map((r) => (
          <option key={r} value={r}>{labels[r]}</option>
        ))}
      </select>
      <ConfirmSubmit
        ask={`Make ${name} ${labels[role].toLowerCase()}?`}
        yes="Yes, change"
        tone="save"
        disabled={pending || role === current}
        className={btn.secondary}
      >
        <UserCog aria-hidden /> {pending ? "Saving…" : "Change role"}
      </ConfirmSubmit>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
