import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { bookStatus } from "@/lib/barnamaj-books";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { loadCurriculum } from "./actions";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function BooksPage() {
  const profile = await requireRole("teacher", "staff");
  const supabase = await createClient();
  const today = todayInLagos();
  const staff = profile.role === "staff";

  let query = supabase
    .from("books")
    .select("id, term_number, subject, title, teacher_id, started_on, finished_on, profiles!books_teacher_id_fkey(full_name)")
    .order("term_number")
    .order("sort_order");
  if (!staff) query = query.eq("teacher_id", profile.id); // teachers: only the books they teach
  const { data: books } = await query;
  const list = books ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold gold-bar">{staff ? "Books & exams" : "My books"}</h1>
        {staff && (
          <Link href="/portal/books/new" className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Add book
          </Link>
        )}
      </div>

      {staff && list.length === 0 && (
        <form action={loadCurriculum} className="mt-4 rounded-xl border p-4 bg-card shadow-sm">
          <p className="text-sm text-muted-foreground">
            No books yet. You can load the school&apos;s 43-book curriculum in one step, then assign a teacher to each book.
          </p>
          <button className="mt-3 h-11 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Load curriculum</button>
        </form>
      )}
      {!staff && list.length === 0 && (
        <p className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No books are assigned to you yet. Ask staff.</p>
      )}

      {[1, 2, 3].map((term) => {
        const rows = list.filter((b) => b.term_number === term);
        if (!rows.length) return null;
        return (
          <section key={term} className="mt-6">
            <h2 className="font-medium">Term {term}</h2>
            <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
              {rows.map((b) => (
                <li key={b.id} className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p lang="ar" dir="rtl" className="font-arabic truncate text-start font-medium">{b.title}</p>
                    <p lang="ar" dir="rtl" className="font-arabic text-start text-sm text-muted-foreground">{b.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.profiles?.full_name ?? "No teacher"} · {bookStatus(b, today)}
                    </p>
                  </div>
                  <Link href={`/portal/books/${b.id}`} className="flex h-10 shrink-0 items-center rounded-lg border px-3 text-sm font-medium hover:bg-muted bg-card">
                    Marks
                  </Link>
                  {staff && (
                    <Link href={`/portal/books/${b.id}/edit`} className="flex h-10 shrink-0 items-center rounded-lg border px-3 text-sm hover:bg-muted bg-card">
                      Edit
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
