import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";

type Status = { label: string; tone: "good" | "warn" | "muted" };
const status = (b: { started_on: string | null; finished_on: string | null }): Status =>
  b.finished_on
    ? { label: "Finished", tone: "good" }
    : b.started_on
      ? { label: "In progress", tone: "warn" }
      : { label: "Not started", tone: "muted" };

// The school's curriculum by term; every active user can read `books`.
export async function Books({ openTerm }: { openTerm: number }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("id, term_number, subject, title, started_on, finished_on")
    .order("term_number")
    .order("sort_order");
  const books = data ?? [];
  const finished = books.filter((b) => b.finished_on).length;
  const now = books.filter((b) => b.started_on && !b.finished_on);

  return (
    <section>
      <h2 className="text-lg font-semibold">Books</h2>
      <p className="text-sm text-muted-foreground">
        {finished} of {books.length} finished
        {now.length > 0 && <> · now: <span lang="ar" dir="rtl" className="font-arabic">{now.map((b) => b.title).join("، ")}</span></>}
      </p>

      {[1, 2, 3].map((n) => {
        const rows = books.filter((b) => b.term_number === n);
        if (!rows.length) return null;
        return (
          <details key={n} open={n === openTerm} className="mt-2 rounded-xl border bg-card shadow-sm">
            <summary className="cursor-pointer p-3 text-sm font-semibold">Term {n} ({rows.length} {rows.length === 1 ? "book" : "books"})</summary>
            <ul className="divide-y border-t text-sm">
              {rows.map((b) => {
                const st = status(b);
                return (
                  <li key={b.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p lang="ar" dir="rtl" className="font-arabic text-start font-medium">{b.title}</p>
                      <p lang="ar" dir="rtl" className="font-arabic text-start text-muted-foreground">{b.subject}</p>
                    </div>
                    <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
      {!books.length && <p className="mt-2 text-sm text-muted-foreground">The book list has not been added yet.</p>}
    </section>
  );
}
