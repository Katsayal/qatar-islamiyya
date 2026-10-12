import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { requireClassAccess } from "@/lib/class-access";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { CommentsForm } from "./comments-form";
import { controlClass } from "@/components/form-parts";
import { FreshOnVisit } from "@/components/fresh-on-visit";

const MAX_COMMENT = 600; // same limit as actions.ts (a "use server" file can only export functions)
const input = controlClass;

export default async function CommentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const profile = await requireRole("teacher", "staff");
  const { id } = await params;
  const sp = await searchParams;
  await requireClassAccess(profile, id);
  const supabase = await createClient();
  const today = todayInLagos();

  const [{ data: c }, { data: terms }, { data: students }] = await Promise.all([
    supabase.from("classes").select("name").eq("id", id).maybeSingle(),
    supabase.from("terms").select("id, number, starts_on, ends_on, academic_years(name)").order("starts_on", { ascending: false }),
    supabase.from("students").select("id, admission_no, full_name").eq("class_id", id).eq("status", "active").order("full_name"),
  ]);
  if (!c) notFound();

  const termList = terms ?? [];
  const current = termList.find((t) => t.starts_on <= today && today <= t.ends_on);
  const term = termList.find((t) => t.id === sp.term) ?? current ?? termList[0];

  const { data: saved } = term
    ? await supabase.from("report_comments").select("student_id, comment").eq("term_id", term.id)
    : { data: [] };
  const initial = Object.fromEntries((saved ?? []).map((r) => [r.student_id, r.comment]));

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href={`/portal/classes/${id}`} className="text-sm text-primary underline-offset-4 hover:underline">
          ← {c.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold gold-bar">Term comments</h1>

        {term ? (
          <>
            <form className="mt-4 flex gap-2">
              <select name="term" defaultValue={term.id} className={`${input} min-w-0 flex-1`}>
                {termList.map((t) => (
                  <option key={t.id} value={t.id}>{t.academic_years?.name} · Term {t.number}</option>
                ))}
              </select>
              <button className="h-11 rounded-lg border px-5 hover:bg-muted bg-card">Go</button>
            </form>
            <p className="mt-3 text-sm text-muted-foreground">
              One comment per student per term, printed on the report card. Leave a box empty to skip. To correct a comment, type the new
              one. If several teachers teach this class, the last saved text is the one kept.
            </p>
            <div className="mt-3">
              {students?.length ? (
                <CommentsForm key={term.id} classId={id} termId={term.id} students={students} initial={initial} maxLength={MAX_COMMENT} />
              ) : (
                <p className="rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No active students in this class.</p>
              )}
            </div>
          </>
        ) : (
          <p className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No terms are set up yet. Ask staff (Academic setup).</p>
        )}
      </div>
    </FreshOnVisit>
  );
}
