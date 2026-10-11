import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { loadCurriculum } from "./actions";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const status = (b: { started_on: string | null; finished_on: string | null }) =>
  b.finished_on ? "Finished" : b.started_on ? "In progress" : "Not started";

export default async function BooksPage() {
  const profile = await requireRole("teacher", "staff");
  const supabase = await createClient();
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
        <h1 className="text-xl font-semibold">{staff ? "Books & exams" : "My books"}</h1>
        {staff && (
          <Link href="/portal/books/new" className="flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Add book
          </Link>
        )}
      </div>

      {staff && list.length === 0 && (
        <form action={loadCurriculum} className="mt-4 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            No books yet. You can load the school&apos;s 43-book curriculum in one step, then assign a teacher to each book.
          </p>
          <button className="mt-3 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">Load curriculum</button>
        </form>
      )}
      {!staff && list.length === 0 && (
        <p className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">No books are assigned to you yet. Ask staff.</p>
      )}

      {[1, 2, 3].map((term) => {
        const rows = list.filter((b) => b.term_number === term);
        if (!rows.length) return null;
        return (
          <section key={term} className="mt-6">
            <h2 className="font-medium">Term {term}</h2>
            <ul className="mt-2 divide-y rounded-lg border">
              {rows.map((b) => (
                <li key={b.id} className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p lang="ar" dir="rtl" className="font-arabic truncate text-start font-medium">{b.title}</p>
                    <p lang="ar" dir="rtl" className="font-arabic text-start text-sm text-muted-foreground">{b.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.profiles?.full_name ?? "No teacher"} · {status(b)}
                    </p>
                  </div>
                  <Link href={`/portal/books/${b.id}`} className="flex h-10 shrink-0 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted">
                    Marks
                  </Link>
                  {staff && (
                    <Link href={`/portal/books/${b.id}/edit`} className="flex h-10 shrink-0 items-center rounded-md border px-3 text-sm hover:bg-muted">
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
