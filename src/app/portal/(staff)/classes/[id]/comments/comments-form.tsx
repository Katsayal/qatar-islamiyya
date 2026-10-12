"use client";

import { startTransition, useActionState } from "react";
import { saveComments, type Result } from "./actions";
import { controlClass } from "@/components/form-parts";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";

type Student = { id: string; full_name: string; admission_no: string };

export function CommentsForm({
  classId,
  termId,
  students,
  initial,
  maxLength,
}: {
  classId: string;
  termId: string;
  students: Student[];
  initial: Record<string, string>;
  maxLength: number;
}) {
  const [state, formAction, pending] = useActionState<Result, FormData>(saveComments, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="grid gap-4"
    >
      <input type="hidden" name="class_id" value={classId} />
      <input type="hidden" name="term_id" value={termId} />

      <ul className="divide-y rounded-xl border bg-card shadow-sm">
        {students.map((s) => (
          <li key={s.id} className="p-3">
            <label className="flex flex-col gap-1">
              <span className="font-medium">{s.full_name}</span>
              <span className="text-sm text-muted-foreground">{s.admission_no}</span>
              <textarea
                name={`comment_${s.id}`}
                rows={3}
                maxLength={maxLength}
                defaultValue={initial[s.id] ?? ""}
                placeholder="Comment for the report card"
                className={`${controlClass} mt-1 h-auto py-2`}
              />
            </label>
          </li>
        ))}
      </ul>

      <button disabled={pending} className={cn(btn.save, big)}>
        <Check aria-hidden /> {pending ? "Saving…" : "Save comments"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
