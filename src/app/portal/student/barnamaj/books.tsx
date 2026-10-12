import { StatusBadge } from "@/components/status-badge";
import { bookStatus, type BookStatus } from "@/lib/barnamaj-books";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

const tone: Record<BookStatus, "good" | "warn" | "muted"> = { Finished: "good", "In progress": "warn", "Not started": "muted" };
const status = (b: { started_on: string | null; finished_on: string | null }, today: string) => {
  const label = bookStatus(b, today);
  return { label, tone: tone[label] };
};

// The school's curriculum by term; every active user can read `books`.
export async function Books({ openTerm }: { openTerm: number }) {
  const supabase = await createClient();
  const today = todayInLagos();
  const { data } = await supabase
    .from("books")
    .select("id, term_number, subject, title, started_on, finished_on")
    .order("term_number")
    .order("sort_order");
  const books = data ?? [];
  const finished = books.filter((b) => bookStatus(b, today) === "Finished").length;
  const now = books.filter((b) => bookStatus(b, today) === "In progress");

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
                const st = status(b, today);
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
