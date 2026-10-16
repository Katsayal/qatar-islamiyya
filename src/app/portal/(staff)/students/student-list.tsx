"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRightLeft } from "lucide-react";
import { btn } from "@/components/buttons";
import { controlClass } from "@/components/form-parts";
import { StatusBadge } from "@/components/status-badge";
import { moveStudents, type MoveResult } from "./actions";

export type ListStudent = { id: string; full_name: string; admission_no: string; gender: string; status: string; classLabel: string };
export type ClassOption = { id: string; name: string; program: string };

// The students on this page, each with a checkbox. Ticked students can be moved to another class
// (only the class changes). The selection is per page: the parent re-creates this when page or filters change.
export function StudentList({ students, classes, emptyText }: { students: ListStudent[]; classes: ClassOption[]; emptyText: string }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [to, setTo] = useState("");
  const [result, setResult] = useState<MoveResult>(null);
  const [pending, start] = useTransition();

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const allPicked = students.length > 0 && students.every((s) => picked.has(s.id));

  function move(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const n = form.getAll("student").length;
    const name = classes.find((c) => c.id === to)?.name;
    if (!n || !name) return;
    if (!window.confirm(`Move ${n} student${n === 1 ? "" : "s"} to ${name}?`)) return;
    start(async () => {
      const r = await moveStudents(null, form);
      setResult(r);
      if (r?.ok) setPicked(new Set());
    });
  }

  return (
    <form onSubmit={move}>
      {result && (
        <p role="status" className={`mt-2 rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}

      <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
        {students.length > 0 && (
          <li>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 ps-4 pe-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={allPicked}
                onChange={() => setPicked(allPicked ? new Set() : new Set(students.map((s) => s.id)))}
                className="size-5"
              />
              Select all on this page ({students.length})
            </label>
          </li>
        )}
        {students.map((s) => (
          <li key={s.id} className="flex items-stretch hover:bg-muted">
            <label className="flex w-12 shrink-0 cursor-pointer items-center justify-center">
              <input type="checkbox" name="student" aria-label={`Select ${s.full_name}`} value={s.id} checked={picked.has(s.id)} onChange={() => toggle(s.id)} className="size-5" />
            </label>
            <Link href={`/portal/students/${s.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pe-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{s.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.admission_no} · {s.classLabel}
                </p>
              </div>
              <div className="shrink-0 text-end text-xs capitalize text-muted-foreground">
                <p>{s.gender}</p>
                {s.status !== "active" && <StatusBadge tone="muted">{s.status}</StatusBadge>}
              </div>
            </Link>
          </li>
        ))}
        {!students.length && <li className="p-4 text-sm text-muted-foreground">{emptyText}</li>}
      </ul>

      {picked.size > 0 && (
        <div className="sticky bottom-3 z-10 mt-3 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-lg">
          <span className="text-sm font-medium">{picked.size} selected</span>
          <select name="to" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Move to class" className={`${controlClass} min-w-0 flex-1`}>
            <option value="">Move to…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.program})
              </option>
            ))}
          </select>
          <button disabled={!to || pending} className={btn.save}>
            <ArrowRightLeft aria-hidden /> {pending ? "Moving…" : "Move"}
          </button>
        </div>
      )}
    </form>
  );
}
