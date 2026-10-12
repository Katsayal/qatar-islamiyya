import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { requireClassAccess } from "@/lib/class-access";
import { linesToPages, maahadPace } from "@/lib/hifz-progress";
import { TOTAL_PAGES } from "@/lib/quran";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { StatusBadge } from "@/components/status-badge";
import { StudentSearch } from "./student-search";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole("teacher", "staff");
  const { id } = await params;
  await requireClassAccess(profile, id);
  const supabase = await createClient();
  const today = todayInLagos();

  const [{ data: c }, { data: students }, { data: year }] = await Promise.all([
    supabase.from("classes").select("id, name, program, level, hifz_unit").eq("id", id).maybeSingle(),
    supabase.from("students").select("id, admission_no, full_name, gender").eq("class_id", id).eq("status", "active").order("full_name"),
    supabase.from("academic_years").select("starts_on, ends_on").lte("starts_on", today).gte("ends_on", today).maybeSingle(),
  ]);
  if (!c) notFound();

  // Hifz classes: pages memorised per student (summed in SQL), plus pace for Ma'ahad.
  const hifz = c.program !== "barnamaj";
  const { data: sums } = hifz
    ? await supabase.rpc("hifz_lines_by_student", { p_class: id, p_from: year?.starts_on ?? today, p_to: year?.ends_on ?? today })
    : { data: [] };
  const sumOf = new Map((sums ?? []).map((r) => [r.student_id, r]));

  const rows = (students ?? []).map((s) => {
    const total = linesToPages(sumOf.get(s.id)?.total_lines ?? 0);
    const pace =
      c.program === "maahad" && year
        ? maahadPace({ memorised: linesToPages(sumOf.get(s.id)?.period_lines ?? 0), yearStart: year.starts_on, yearEnd: year.ends_on, today })
        : null;
    return { ...s, total, pace };
  });
  // Ma'ahad: students behind pace first (biggest shortfall on top); everyone else keeps name order.
  if (c.program === "maahad" && year) {
    rows.sort((a, b) => Number(a.pace!.onTrack) - Number(b.pace!.onTrack) || a.pace!.diff - b.pace!.diff);
  }
  const behind = c.program === "maahad" && year ? rows.filter((r) => !r.pace!.onTrack).length : null;

  return (
    <div>
      <Link href="/portal/classes" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Classes
      </Link>
      <h1 className="mt-2 text-2xl font-semibold gold-bar">{c.name}</h1>
      <p className="text-sm capitalize text-muted-foreground">
        {c.program}
        {c.level ? ` · Level ${c.level}` : ""}
        {c.hifz_unit ? ` · ${c.hifz_unit}` : ""} · {rows.length} active student{rows.length === 1 ? "" : "s"}
      </p>

      {behind !== null && rows.length > 0 && (
        <p className="mt-2 text-sm">
          <StatusBadge tone={behind ? "bad" : "good"}>
            {behind ? `${behind} of ${rows.length} behind pace` : "Everyone on track"}
          </StatusBadge>
        </p>
      )}

      {c.program === "barnamaj" && (
        <Link
          href={`/portal/classes/${c.id}/attendance`}
          className="mt-4 flex h-12 items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          Take attendance
        </Link>
      )}

      {hifz && (
        <p className="mt-4 text-xs text-muted-foreground">
          Tap a student for their hifz. Pages memorised = all new hifz recorded.
          {c.program === "maahad" && " Students behind this year's pace are listed first."}
        </p>
      )}

      <StudentSearch
        rows={rows.map((s) => ({
          id: s.id,
          search: `${s.full_name} ${s.admission_no}`.toLowerCase(),
          row: (
            <>
              <Link href={`/portal/classes/${c.id}/students/${s.id}`} className="min-w-0 flex-1 p-3 hover:bg-muted">
                <p className="truncate font-medium">{s.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.admission_no} · <span className="capitalize">{s.gender}</span>
                </p>
                {hifz && (
                  <p className="mt-1 text-sm">
                    {s.total} / {TOTAL_PAGES} pages ({Math.round((s.total / TOTAL_PAGES) * 1000) / 10}%)
                    {s.pace && (
                      <span className="ms-2">
                        <StatusBadge tone={s.pace.onTrack ? "good" : "bad"}>
                          {s.pace.onTrack ? "On track" : `Behind by ${Math.abs(s.pace.diff)}`}
                        </StatusBadge>
                      </span>
                    )}
                  </p>
                )}
              </Link>
              {hifz && (
                <Link
                  href={`/portal/classes/${c.id}/students/${s.id}/hifz`}
                  className="flex h-10 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Record
                </Link>
              )}
            </>
          ),
        }))}
      />

      <section className="mt-8 rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="font-semibold">End of term</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Write one short comment per student for the report card, once per term. You can come back and change it until
          report cards are printed.
        </p>
        <Link
          href={`/portal/classes/${c.id}/comments`}
          className="mt-3 flex h-11 items-center justify-center rounded-lg border bg-card text-sm font-medium hover:bg-muted"
        >
          Write term comments
        </Link>
      </section>
    </div>
  );
}
