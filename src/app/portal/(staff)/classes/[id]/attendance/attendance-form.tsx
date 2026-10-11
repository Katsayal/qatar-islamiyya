"use client";

import { startTransition, useActionState } from "react";
import { STATUSES, type Status } from "@/lib/attendance";
import { saveAttendance, type Result } from "./actions";

type Student = { id: string; full_name: string; admission_no: string };

const tone: Record<Status, string> = {
  present: "has-[:checked]:border-primary has-[:checked]:bg-primary/10",
  absent: "has-[:checked]:border-destructive has-[:checked]:bg-destructive/10",
  excused: "has-[:checked]:border-foreground/40 has-[:checked]:bg-muted",
};

export function AttendanceForm({
  classId,
  date,
  students,
  initial,
}: {
  classId: string;
  date: string;
  students: Student[];
  initial: Record<string, Status>;
}) {
  const [state, formAction, pending] = useActionState<Result, FormData>(saveAttendance, { ok: false, message: null });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="grid gap-4"
    >
      <input type="hidden" name="class_id" value={classId} />
      <input type="hidden" name="att_date" value={date} />

      <ul className="divide-y rounded-xl border bg-card shadow-sm">
        {students.map((s) => (
          <li key={s.id} className="p-3">
            <p className="font-medium">{s.full_name}</p>
            <p className="text-sm text-muted-foreground">{s.admission_no}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {STATUSES.map((st) => (
                <label key={st.value} className={`flex h-11 items-center justify-center rounded-lg border text-sm ${tone[st.value]}`}>
                  <input
                    type="radio"
                    name={`status_${s.id}`}
                    value={st.value}
                    defaultChecked={(initial[s.id] ?? "present") === st.value}
                    className="sr-only"
                  />
                  {st.label}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <button disabled={pending} className="h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
        {pending ? "Saving…" : "Save attendance"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
