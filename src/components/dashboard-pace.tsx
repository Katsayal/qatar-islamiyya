import Link from "next/link";
import { linesToPages, maahadPace } from "@/lib/hifz-progress";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

const SHOWN = 10;

// Same rule as the class and history pages: expected pages grow evenly over the academic year, on track = 90%.
export async function DashboardPace() {
  const supabase = await createClient();
  const today = todayInLagos();

  const [{ data: year }, { data: classes }] = await Promise.all([
    supabase.from("academic_years").select("starts_on, ends_on").lte("starts_on", today).gte("ends_on", today).maybeSingle(),
    supabase.from("classes").select("id, name").eq("program", "maahad").eq("active", true).order("sort_order").order("name"),
  ]);

  const title = <h2 className="font-semibold">Ma&apos;ahad pace</h2>;
  if (!year) {
    return (
      <section>
        {title}
        <p className="mt-1 text-sm text-muted-foreground">No academic year contains today&apos;s date.</p>
      </section>
    );
  }

  const perClass = await Promise.all(
    (classes ?? []).map(async (c) => {
      const [{ data: students }, { data: sums }] = await Promise.all([
        supabase.from("students").select("id, full_name").eq("class_id", c.id).eq("status", "active"),
        supabase.rpc("hifz_lines_by_student", { p_class: c.id, p_from: year.starts_on, p_to: year.ends_on }),
      ]);
      const lines = new Map((sums ?? []).map((r) => [r.student_id, r.period_lines]));
      return (students ?? []).map((s) => ({
        id: s.id,
        name: s.full_name,
        classId: c.id,
        className: c.name,
        pace: maahadPace({ memorised: linesToPages(lines.get(s.id) ?? 0), yearStart: year.starts_on, yearEnd: year.ends_on, today }),
      }));
    }),
  );
  const all = perClass.flat();
  const behind = all.filter((s) => !s.pace.onTrack).sort((a, b) => a.pace.diff - b.pace.diff);

  return (
    <section>
      {title}
      {all.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">No active Ma&apos;ahad students yet.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className={`text-2xl font-semibold ${behind.length ? "text-destructive" : "text-primary"}`}>{behind.length}</span> of {all.length} students are behind
            this year&apos;s pace.
          </p>
          {behind.length > 0 && (
            <ul className="mt-2 divide-y rounded-lg border text-sm">
              {behind.slice(0, SHOWN).map((s) => (
                <li key={s.id}>
                  <Link href={`/portal/classes/${s.classId}/students/${s.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-muted">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.className}</span>
                    </span>
                    <span className="shrink-0 text-destructive">Behind by {Math.abs(s.pace.diff)}</span>
                  </Link>
                </li>
              ))}
              {behind.length > SHOWN && <li className="p-3 text-xs text-muted-foreground">Showing the {SHOWN} furthest behind. Open a class to see everyone.</li>}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
