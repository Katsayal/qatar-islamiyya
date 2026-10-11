import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { Attendance } from "./attendance";
import { Books } from "./books";
import { Marks } from "./marks";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const input = "h-11 rounded-md border bg-background px-3 text-base";

export default async function StudentBarnamajPage({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  await requireRole("student");
  const sp = await searchParams;
  const supabase = await createClient();
  const today = todayInLagos();

  // RLS: a student can only read their own row.
  const [{ data: s }, { data: terms }] = await Promise.all([
    supabase.from("students").select("class_id, classes(name, program)").maybeSingle(),
    supabase.from("terms").select("id, number, starts_on, ends_on, academic_years(name)").order("starts_on", { ascending: false }),
  ]);

  const termList = terms ?? [];
  const term = termList.find((t) => t.id === sp.term) ?? termList.find((t) => t.starts_on <= today && today <= t.ends_on) ?? termList[0];

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">My Barnamaj</h1>
        {s?.classes && <p className="text-sm text-muted-foreground">{s.classes.name}</p>}
      </div>

      {s?.classes?.program !== "barnamaj" ? (
        <p className="text-sm text-muted-foreground">This page is for Barnamaj students.</p>
      ) : (
        <>
          <form className="flex gap-2">
            <select name="term" defaultValue={term?.id} className={`${input} min-w-0 flex-1`}>
              {termList.map((t) => (
                <option key={t.id} value={t.id}>{t.academic_years?.name} · Term {t.number}</option>
              ))}
            </select>
            <button className="h-11 rounded-md bg-primary px-5 text-primary-foreground">Show</button>
          </form>

          {term && (
            <>
              <Suspense fallback={null}>
                <Attendance termId={term.id} />
              </Suspense>
              <Suspense fallback={null}>
                <Marks termId={term.id} />
              </Suspense>
            </>
          )}
          <Suspense fallback={null}>
            <Books openTerm={term?.number ?? 1} />
          </Suspense>
        </>
      )}
    </div>
  );
}
