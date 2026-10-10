import { createClient } from "@/lib/supabase/server";

type Status = { label: string; className: string };
const status = (b: { started_on: string | null; finished_on: string | null }): Status =>
  b.finished_on
    ? { label: "Finished", className: "text-primary" }
    : b.started_on
      ? { label: "In progress", className: "text-amber-600" }
      : { label: "Not started", className: "text-muted-foreground" };

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
      <h2 className="font-semibold">Books</h2>
      <p className="text-sm text-muted-foreground">
        {finished} of {books.length} finished
        {now.length > 0 && <> · now: <span lang="ar" dir="rtl" className="font-arabic">{now.map((b) => b.title).join("، ")}</span></>}
      </p>

      {[1, 2, 3].map((n) => {
        const rows = books.filter((b) => b.term_number === n);
        if (!rows.length) return null;
        return (
          <details key={n} open={n === openTerm} className="mt-2 rounded-lg border">
            <summary className="cursor-pointer p-3 text-sm font-medium">Term {n} ({rows.length} {rows.length === 1 ? "book" : "books"})</summary>
            <ul className="divide-y border-t text-sm">
              {rows.map((b) => {
                const st = status(b);
                return (
                  <li key={b.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p lang="ar" dir="rtl" className="font-arabic text-start font-medium">{b.title}</p>
                      <p lang="ar" dir="rtl" className="font-arabic text-start text-muted-foreground">{b.subject}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-medium ${st.className}`}>{st.label}</span>
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
