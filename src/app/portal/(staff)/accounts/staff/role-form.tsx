"use client";

import { startTransition, useActionState } from "react";
import { UserCog } from "lucide-react";
import { btn } from "@/components/buttons";
import { controlClass } from "@/components/form-parts";
import { changeRole, type Result } from "../actions";

const labels = { teacher: "Teacher", staff: "Staff", owner: "Owner" } as const;
type RoleKey = keyof typeof labels;

// Owner only: Teacher · Staff · Owner for someone else's account (the server checks this too).
export function RoleForm({ userId, name, current }: { userId: string; name: string; current: RoleKey }) {
  const [state, formAction, pending] = useActionState<Result, FormData>(changeRole, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const role = fd.get("role") as RoleKey;
        if (role === current) return;
        if (!window.confirm(`Make ${name} ${labels[role].toLowerCase()}?`)) return;
        startTransition(() => formAction(fd));
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="flex gap-2">
        <select name="role" defaultValue={current} aria-label={`Role of ${name}`} className={`flex-1 ${controlClass}`}>
          {(Object.keys(labels) as RoleKey[]).map((r) => (
            <option key={r} value={r}>{labels[r]}</option>
          ))}
        </select>
        <button disabled={pending} className={btn.secondary}>
          <UserCog aria-hidden /> {pending ? "Saving…" : "Change role"}
        </button>
      </div>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
