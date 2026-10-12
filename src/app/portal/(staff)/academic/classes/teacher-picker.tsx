"use client";

import { useState } from "react";
import { controlClass } from "@/components/form-parts";
import { StatusBadge } from "@/components/status-badge";

export type Person = { id: string; full_name: string; role: string };

// Checklist of teachers and staff who teach, with a name search.
// People ticked when the form opened are listed first (the order never changes while clicking),
// and ticked people are never hidden by the search. Hidden rows stay in the form, so they still submit.
export function TeacherPicker({ people, initial }: { people: Person[]; initial: string[] }) {
  const [selected, setSelected] = useState(() => new Set(initial));
  const [query, setQuery] = useState("");
  const [ordered] = useState(() =>
    [...people].sort(
      (a, b) =>
        Number(initial.includes(b.id)) - Number(initial.includes(a.id)) || a.full_name.localeCompare(b.full_name),
    ),
  );

  const q = query.trim().toLowerCase();
  const visible = (p: Person) => !q || selected.has(p.id) || p.full_name.toLowerCase().includes(q);
  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <fieldset>
      <legend className="flex w-full items-baseline justify-between gap-2 text-sm">
        <span>Teachers (Tahfiz and Ma&apos;ahad: one; Barnamaj: several). Staff who teach are listed too.</span>
        <span className="shrink-0 text-muted-foreground">{selected.size} selected</span>
      </legend>

      {people.length > 0 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          aria-label="Search teachers and staff by name"
          className={`mt-2 w-full ${controlClass}`}
        />
      )}

      <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-lg border bg-card p-2">
        {ordered.map((p) => (
          <label key={p.id} hidden={!visible(p)} className="flex min-h-10 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="teacher_ids"
              value={p.id}
              checked={selected.has(p.id)}
              onChange={(e) => toggle(p.id, e.target.checked)}
              className="size-4"
            />
            <span className="flex-1">{p.full_name}</span>
            <StatusBadge tone="muted">{p.role === "staff" ? "Staff" : "Teacher"}</StatusBadge>
          </label>
        ))}
        {people.length > 0 && !ordered.some(visible) && <p className="p-2 text-sm text-muted-foreground">No one matches.</p>}
        {!people.length && <p className="p-2 text-sm text-muted-foreground">No teacher or staff accounts yet.</p>}
      </div>
    </fieldset>
  );
}
