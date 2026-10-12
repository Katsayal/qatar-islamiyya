"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { controlClass } from "@/components/form-parts";

// The class's student list with a magnifier: tap it, type a name or admission no., the list filters as you type.
// Rows are built on the server; this only shows or hides them.
export function StudentSearch({ rows }: { rows: { id: string; search: string; row: React.ReactNode }[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? rows.filter((r) => r.search.includes(q)) : rows;

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="mt-2">
      {rows.length > 0 &&
        (open ? (
          <div className="flex items-center gap-2">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or admission no."
              aria-label="Search students in this class"
              className={`${controlClass} min-w-0 flex-1`}
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-card hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search students"
            className="flex size-11 items-center justify-center rounded-lg border bg-card hover:bg-muted"
          >
            <Search className="size-5" />
          </button>
        ))}

      <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
        {shown.map((r) => (
          <li key={r.id} className="flex items-center gap-2 pe-3">
            {r.row}
          </li>
        ))}
        {!rows.length && <li className="p-4 text-sm text-muted-foreground">No active students in this class.</li>}
        {rows.length > 0 && !shown.length && <li className="p-4 text-sm text-muted-foreground">No student matches “{query}”.</li>}
      </ul>
    </div>
  );
}
