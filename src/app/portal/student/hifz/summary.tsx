import { linesToPages, maahadPace } from "@/lib/hifz-progress";
import { TOTAL_PAGES } from "@/lib/quran";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

const card = "rounded-lg border p-3";

// Totals, this term, and (Ma'ahad) pace. The SQL functions run as the student, so RLS returns only their own row.
export async function Summary({ classId, program }: { classId: string; program: string }) {
  const supabase = await createClient();
  const today = todayInLagos();

  const [{ data: year }, { data: term }] = await Promise.all([
    supabase.from("academic_years").select("starts_on, ends_on").lte("starts_on", today).gte("ends_on", today).maybeSingle(),
    supabase.from("terms").select("id, number").lte("starts_on", today).gte("ends_on", today).maybeSingle(),
  ]);

  const [{ data: lines }, { data: stats }] = await Promise.all([
    supabase.rpc("hifz_lines_by_student", { p_class: classId, p_from: year?.starts_on ?? today, p_to: year?.ends_on ?? today }),
    term ? supabase.rpc("term_report_stats", { p_class: classId, p_term: term.id }) : Promise.resolve({ data: null }),
  ]);

  const total = linesToPages(lines?.[0]?.total_lines ?? 0);
  const percent = Math.round((total / TOTAL_PAGES) * 1000) / 10;
  const s = stats?.[0];
  const pace =
    program === "maahad" && year
      ? maahadPace({ memorised: linesToPages(lines?.[0]?.period_lines ?? 0), yearStart: year.starts_on, yearEnd: year.ends_on, today })
      : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className={card}>
          <p className="text-muted-foreground">Memorised (new)</p>
          <p className="text-lg font-semibold">{total} / {TOTAL_PAGES} pages</p>
          <p className="text-muted-foreground">{percent}% of the Qur&apos;an</p>
        </div>
        <div className={card}>
          <p className="text-muted-foreground">{term ? `Term ${term.number}` : "This term"}</p>
          <p className="text-lg font-semibold">{linesToPages(s?.term_lines ?? 0)} pages</p>
          <p className="text-muted-foreground">
            {s?.present_days ?? 0} days present · {s?.absent_days ?? 0} absent
          </p>
        </div>
      </div>

      {pace && (
        <div className={`${card} text-sm`}>
          <p className="font-medium">
            Pace this year:{" "}
            <span className={pace.onTrack ? "text-primary" : "text-destructive"}>
              {pace.onTrack ? "On track" : `Behind by ${Math.abs(pace.diff)} pages`}
            </span>
          </p>
          <p className="text-muted-foreground">
            Expected by today: {pace.expected} pages ({pace.diff >= 0 ? "+" : ""}{pace.diff} now).
            {pace.projectedFinish
              ? ` At this rate you finish the whole Qur'an on ${pace.projectedFinish}${pace.afterYearEnd ? " (after the year ends)" : ""}.`
              : ""}
          </p>
        </div>
      )}
    </>
  );
}
