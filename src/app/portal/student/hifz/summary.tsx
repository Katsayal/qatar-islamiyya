import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { linesToPages, maahadPace } from "@/lib/hifz-progress";
import { TOTAL_PAGES } from "@/lib/quran";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

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
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Memorised (new)</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-primary">{total}</span>
          <span className="text-muted-foreground">/ {TOTAL_PAGES} pages</span>
          <span className="ms-auto font-semibold">{percent}%</span>
        </p>
        <div className="mt-3">
          <ProgressBar value={total} max={TOTAL_PAGES} label="Pages of the Qur'an memorised" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">{term ? `Term ${term.number}` : "This term"}</p>
        <p className="mt-1 text-xl font-semibold">{linesToPages(s?.term_lines ?? 0)} pages</p>
        <p className="mt-1 flex flex-wrap gap-2 text-sm">
          <StatusBadge tone="good">{s?.present_days ?? 0} days present</StatusBadge>
          <StatusBadge tone={s?.absent_days ? "bad" : "muted"}>{s?.absent_days ?? 0} absent</StatusBadge>
        </p>
      </div>

      {pace && (
        <div className="rounded-xl border bg-card p-4 text-sm shadow-sm">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            Pace this year
            <StatusBadge tone={pace.onTrack ? "good" : "bad"}>
              {pace.onTrack ? "On track" : `Behind by ${Math.abs(pace.diff)} pages`}
            </StatusBadge>
          </p>
          <p className="mt-2 text-muted-foreground">
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
