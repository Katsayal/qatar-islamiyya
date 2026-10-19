"use client";

import { startTransition, useActionState } from "react";
import { promoteStudents } from "./actions";
import { controlClass } from "@/components/form-parts";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { ConfirmSubmit } from "@/components/confirm-submit";

type Student = { id: string; full_name: string; admission_no: string };
type Destination = { id: string; name: string; program: string; level: number | null };

const input = controlClass;

function Message({ result }: { result: { ok: boolean; message: string } | null }) {
  if (!result) return null;
  return (
    <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
      {result.message}
      {result.ok && " Remember to set the new year's fees on the Fees page."}
    </p>
  );
}

export function PromoteForm({
  fromId,
  fromName,
  students,
  destinations,
  defaultTo,
}: {
  fromId: string;
  fromName: string;
  students: Student[];
  destinations: Destination[];
  defaultTo: string;
}) {
  const [result, formAction, pending] = useActionState(promoteStudents, null);

  // Stay mounted when the last student leaves, so the success message is not lost.
  if (students.length === 0) {
    return (
      <div className="mt-4 flex flex-col gap-3">
        <Message result={result} />
        <p className="rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No active students in {fromName}.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        startTransition(() => formAction(form));
      }}
      className="mt-4 flex flex-col gap-4"
    >
      <input type="hidden" name="from" value={fromId} />

      <fieldset>
        <legend className="text-sm font-medium">Students moving (untick anyone staying behind)</legend>
        <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
          {students.map((s) => (
            <li key={s.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 p-3">
                <input type="checkbox" name="student" value={s.id} defaultChecked className="size-5" />
                <span className="min-w-0">
                  <span className="block truncate">{s.full_name}</span>
                  <span className="text-xs text-muted-foreground">{s.admission_no}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Move them to
        <select name="to" defaultValue={defaultTo} required className={input}>
          <option value="" disabled>Choose…</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.program}
              {d.level ? ` · level ${d.level}` : ""})
            </option>
          ))}
          <option value="graduate">Graduate (leaves the school)</option>
        </select>
      </label>

      <Message result={result} />
      <ConfirmSubmit
        ask={(f) => {
          const form = new FormData(f);
          const to = String(form.get("to") ?? "");
          const count = form.getAll("student").length;
          if (!to || !count) return null; // nothing to confirm: the server explains what is missing
          const label = to === "graduate" ? "graduate" : `move to ${destinations.find((d) => d.id === to)?.name ?? "the chosen class"}`;
          return `${count} student${count === 1 ? "" : "s"}: ${label}?`;
        }}
        yes="Yes, move"
        tone="save"
        disabled={pending}
        className={cn(btn.save, big)}
      >
        <ArrowRightLeft aria-hidden /> {pending ? "Moving…" : "Move students"}
      </ConfirmSubmit>
    </form>
  );
}
