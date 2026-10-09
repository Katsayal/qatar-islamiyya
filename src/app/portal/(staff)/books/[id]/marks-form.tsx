"use client";

import { startTransition, useActionState } from "react";
import { saveMarks, type Result } from "./actions";

type Student = { id: string; full_name: string; admission_no: string };

export function MarksForm({
  bookId,
  termId,
  students,
  initial,
}: {
  bookId: string;
  termId: string;
  students: Student[];
  initial: Record<string, number>;
}) {
  const [state, formAction, pending] = useActionState<Result, FormData>(saveMarks, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="grid gap-4"
    >
      <input type="hidden" name="book_id" value={bookId} />
      <input type="hidden" name="term_id" value={termId} />

      <ul className="divide-y rounded-lg border">
        {students.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{s.full_name}</p>
              <p className="text-sm text-muted-foreground">{s.admission_no}</p>
            </div>
            <input
              name={`score_${s.id}`}
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              placeholder="/100"
              aria-label={`Mark for ${s.full_name}`}
              defaultValue={initial[s.id] ?? ""}
              className="h-11 w-24 shrink-0 rounded-md border bg-background px-3 text-center text-base"
            />
          </li>
        ))}
      </ul>

      <button disabled={pending} className="h-12 rounded-md bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50">
        {pending ? "Saving…" : "Save marks"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-primary" : "text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
