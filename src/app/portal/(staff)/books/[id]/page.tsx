import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { MarksForm } from "./marks-form";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const input = "h-11 rounded-md border bg-background px-3 text-base";

export default async function BookMarksPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const profile = await requireRole("teacher", "staff");
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const today = todayInLagos();

  const [{ data: book }, { data: terms }, { data: classes }] = await Promise.all([
    supabase.from("books").select("title, subject, teacher_id").eq("id", id).maybeSingle(),
    supabase.from("terms").select("id, number, starts_on, ends_on, academic_years(name)").order("starts_on", { ascending: false }),
    supabase.from("classes").select("id").eq("program", "barnamaj"),
  ]);
  // Teachers may only open the books assigned to them (RLS also blocks the write).
  if (!book || (profile.role === "teacher" && book.teacher_id !== profile.id)) notFound();

  const termList = terms ?? [];
  const current = termList.find((t) => t.starts_on <= today && today <= t.ends_on);
  const term = termList.find((t) => t.id === sp.term) ?? current ?? termList[0];

  const [{ data: students }, { data: marks }] = await Promise.all([
    supabase
      .from("students")
      .select("id, admission_no, full_name")
      .eq("status", "active")
      .in("class_id", (classes ?? []).map((c) => c.id))
      .order("full_name"),
    term ? supabase.from("exam_results").select("student_id, score").eq("book_id", id).eq("term_id", term.id) : Promise.resolve({ data: [] }),
  ]);
  const initial = Object.fromEntries((marks ?? []).map((m) => [m.student_id, m.score]));

  return (
    <div className="max-w-xl">
      <Link href="/portal/books" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Books
      </Link>
      <h1 lang="ar" dir="rtl" className="font-arabic mt-2 text-xl font-semibold">{book.title}</h1>
      <p lang="ar" dir="rtl" className="font-arabic text-sm text-muted-foreground">{book.subject}</p>

      {term ? (
        <>
          <form className="mt-4 flex gap-2">
            <select name="term" defaultValue={term.id} className={`${input} min-w-0 flex-1`}>
              {termList.map((t) => (
                <option key={t.id} value={t.id}>{t.academic_years?.name} · Term {t.number}</option>
              ))}
            </select>
            <button className="h-11 rounded-md border px-5 hover:bg-muted">Go</button>
          </form>
          <p className="mt-3 text-sm text-muted-foreground">
            Marks out of 100. Leave a box empty to skip that student. To correct a mark, type the new one.
          </p>
          <div className="mt-3">
            {students?.length ? (
              <MarksForm key={term.id} bookId={id} termId={term.id} students={students} initial={initial} />
            ) : (
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">No active Barnamaj students.</p>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">No terms are set up yet. Ask staff (Academic setup).</p>
      )}
    </div>
  );
}
