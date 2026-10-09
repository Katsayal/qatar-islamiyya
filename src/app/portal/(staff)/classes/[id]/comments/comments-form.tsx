"use client";

import { startTransition, useActionState } from "react";
import { saveComments, type Result } from "./actions";

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

      <ul className="divide-y rounded-lg border">
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
                className="mt-1 rounded-md border bg-background px-3 py-2 text-base"
              />
            </label>
          </li>
        ))}
      </ul>

      <button disabled={pending} className="h-12 rounded-md bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Saving…" : "Save comments"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-primary" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
