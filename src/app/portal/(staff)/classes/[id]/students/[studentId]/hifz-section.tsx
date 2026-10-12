import Link from "next/link";
import { isBelowMinimum, maahadPace, MAAHAD_MIN_PAGES, totalNewPages } from "@/lib/hifz-progress";
import { TOTAL_PAGES } from "@/lib/quran";
import { createClient } from "@/lib/supabase/server";
import { surahs } from "@/lib/surahs";
import { todayInLagos } from "@/lib/today";
import { controlClass } from "@/components/form-parts";
import { PickerForm } from "@/components/picker-form";
import { StatusBadge } from "@/components/status-badge";
import { DeleteEntry } from "./delete-entry";

const PAGE_SIZE = 25;
const gradeLabel: Record<string, string> = { jayyid: "Jayyid", jayyid_jiddan: "Jayyid Jiddan", mumtaz: "Mumtaz" };
const surahName = (n: number | null) => surahs.find((s) => s.number === n)?.name ?? "?";
const card = "rounded-xl border bg-card p-3 shadow-sm";
const pageButton = "inline-flex h-11 items-center rounded-lg border bg-card px-4 font-medium text-primary hover:border-primary";

// Progress summary, Ma'ahad pace and every hifz entry of one student (newest first, term filter, 25 per page).
export async function HifzSection({
  studentId,
  program,
  basePath,
  isStaff,
  sp,
}: {
  studentId: string;
  program: string;
  basePath: string;
  isStaff: boolean;
  sp: { term?: string; page?: string };
}) {
  const supabase = await createClient();
  const today = todayInLagos();
  const [{ data: all }, { data: terms }, { data: year }] = await Promise.all([
    supabase
      .from("hifz_entries")
      .select("id, entry_date, term_id, absent, lesson_type, start_surah, start_ayah, end_surah, end_ayah, pages, lines, grade, note")
      .eq("student_id", studentId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(0, 1999),
    supabase.from("terms").select("id, number, academic_years(name)").order("starts_on", { ascending: false }),
    supabase.from("academic_years").select("starts_on, ends_on").lte("starts_on", today).gte("ends_on", today).maybeSingle(),
  ]);

  const entries = all ?? [];
  const total = totalNewPages(entries);
  const absentDays = entries.filter((e) => e.absent).length;
  const pace =
    program === "maahad" && year
      ? maahadPace({
          memorised: totalNewPages(entries.filter((e) => e.entry_date >= year.starts_on && e.entry_date <= year.ends_on)),
          yearStart: year.starts_on,
          yearEnd: year.ends_on,
          today,
        })
      : null;

  const term = (terms ?? []).some((t) => t.id === sp.term) ? sp.term : undefined;
  const shown = term ? entries.filter((e) => e.term_id === term) : entries;
  const page = Math.max(1, Number(sp.page) || 1);
  const lastPage = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const rows = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (n: number) => `?${new URLSearchParams({ ...(term ? { term } : {}), page: String(n) })}`;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Hifz</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div className={card}>
          <p className="text-muted-foreground">Memorised (new)</p>
          <p className="text-lg font-semibold">{total} / {TOTAL_PAGES} pages</p>
          <p className="text-muted-foreground">{Math.round((total / TOTAL_PAGES) * 1000) / 10}% of the Qur&apos;an</p>
        </div>
        <div className={card}>
          <p className="text-muted-foreground">Entries</p>
          <p className="text-lg font-semibold">{entries.length}</p>
          <p className="text-muted-foreground">{absentDays} absent</p>
        </div>
      </div>

      {pace && (
        <div className={`mt-3 ${card} text-sm`}>
          <p className="font-medium">
            Pace this year:{" "}
            <span className={pace.onTrack ? "text-primary" : "text-destructive"}>
              {pace.onTrack ? "On track" : `Behind by ${Math.abs(pace.diff)} pages`}
            </span>
          </p>
          <p className="text-muted-foreground">
            Expected by today: {pace.expected} pages ({pace.diff >= 0 ? "+" : ""}{pace.diff} now).
            {pace.projectedFinish
              ? ` At this rate the whole Qur'an is finished on ${pace.projectedFinish}${pace.afterYearEnd ? " (after the year ends)" : ""}.`
              : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Counts calendar days, holidays included; new lessons only.</p>
        </div>
      )}

      <PickerForm action={basePath} className="mt-4">
        <select name="term" defaultValue={term ?? ""} aria-label="Show entries of" className={`${controlClass} w-full`}>
          <option value="">All terms</option>
          {(terms ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.academic_years?.name} · Term {t.number}</option>
          ))}
        </select>
      </PickerForm>

      <p className="mt-3 text-sm text-muted-foreground">{shown.length} entr{shown.length === 1 ? "y" : "ies"}</p>
      <ul className="mt-2 divide-y rounded-xl border bg-card text-sm shadow-sm">
        {rows.map((e) => (
          <li key={e.id} className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="font-medium">
                {e.entry_date} · {e.absent ? "Absent" : e.lesson_type === "new" ? "New hifz" : "Muraja'ah"}
                {program === "maahad" && isBelowMinimum(e) && (
                  <span className="ms-2">
                    <StatusBadge tone="bad">Below {MAAHAD_MIN_PAGES} pages</StatusBadge>
                  </span>
                )}
              </p>
              {!e.absent && (
                <p className="text-muted-foreground">
                  {surahName(e.start_surah)} {e.start_ayah} → {surahName(e.end_surah)} {e.end_ayah} · {e.pages}{" "}
                  {e.pages === 1 ? "page" : "pages"} · {gradeLabel[e.grade ?? ""] ?? e.grade}
                </p>
              )}
              {e.note && <p className="text-muted-foreground">“{e.note}”</p>}
            </div>
            {isStaff && <DeleteEntry id={e.id} />}
          </li>
        ))}
        {!rows.length && <li className="p-3 text-muted-foreground">No entries yet.</li>}
      </ul>

      {lastPage > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)} className={pageButton}>← Newer</Link> : <span />}
          <span className="text-muted-foreground">Page {page} of {lastPage}</span>
          {page < lastPage ? <Link href={pageHref(page + 1)} className={pageButton}>Older →</Link> : <span />}
        </nav>
      )}
    </section>
  );
}
