"use client";

import { startTransition, useActionState } from "react";
import { saveMarks, type Result } from "./actions";
import { controlClass } from "@/components/form-parts";

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

      <ul className="divide-y rounded-xl border bg-card shadow-sm">
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
              className={`${controlClass} w-24 shrink-0 text-center`}
            />
          </li>
        ))}
      </ul>

      <button disabled={pending} className="h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
        {pending ? "Saving…" : "Save marks"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
