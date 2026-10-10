import { PrintButton } from "@/components/print-button";
import { ReportCard } from "@/components/report-card";
import { requireRole } from "@/lib/auth";
import { loadCards } from "@/lib/report-cards";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

const input = "h-11 rounded-md border bg-background px-3 text-base";

export default async function StudentReportCardsPage({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  await requireRole("student");
  const sp = await searchParams;
  const supabase = await createClient();
  const today = todayInLagos();

  // RLS: a student can only read their own row, so these are always their own numbers.
  const [{ data: s }, { data: terms }] = await Promise.all([
    supabase.from("students").select("id, admission_no, full_name, classes(id, name, program)").maybeSingle(),
    supabase
      .from("terms")
      .select("id, number, starts_on, ends_on, academic_years(name)")
      .lte("starts_on", today) // terms that have not started have nothing to show
      .order("starts_on", { ascending: false }),
  ]);

  const termList = terms ?? [];
  const term = termList.find((t) => t.id === sp.term) ?? termList.find((t) => today <= t.ends_on) ?? termList[0];

  const cards =
    s?.classes && term ? await loadCards(supabase, { classRow: s.classes, term, students: [s] }) : [];

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <h1 className="text-xl font-semibold">My report card</h1>
        <p className="text-sm text-muted-foreground">Pick a term, then print it or save it as a PDF.</p>
      </div>

      {!s?.classes ? (
        <p className="text-sm text-muted-foreground">You are not in a class yet, so there is no report card.</p>
      ) : !term ? (
        <p className="text-sm text-muted-foreground">No term has started yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <form className="flex min-w-0 flex-1 gap-2">
              <select name="term" defaultValue={term.id} className={`${input} min-w-0 flex-1`}>
                {termList.map((t) => (
                  <option key={t.id} value={t.id}>{t.academic_years?.name} · Term {t.number}</option>
                ))}
              </select>
              <button className="h-11 rounded-md border px-4 text-sm hover:bg-muted">Show</button>
            </form>
            <PrintButton />
          </div>
          {cards.map((d) => (
            <ReportCard key={d.admissionNo} d={d} />
          ))}
        </>
      )}
    </div>
  );
}
