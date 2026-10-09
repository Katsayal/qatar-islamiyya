// Hifz totals and Ma'ahad pace. Pure functions so `node --test` can run them.
import { LINES_PER_PAGE, TOTAL_PAGES } from "./quran.ts";

export const MAAHAD_MIN_PAGES = 2; // a new lesson below this is flagged
export const PACE_TOLERANCE = 0.9; // "on track" = at least 90% of the expected pages

type Entry = { absent: boolean; lesson_type: string | null; lines: number | null; pages: number | null };

const round2 = (n: number) => Math.round(n * 100) / 100;

export const linesToPages = (lines: number) => round2(lines / LINES_PER_PAGE);

// Pages memorised = lines of every New entry ÷ 15. Repeats of the same range are not de-duplicated.
export function totalNewPages(entries: Pick<Entry, "absent" | "lesson_type" | "lines">[]) {
  const lines = entries.reduce((sum, e) => (!e.absent && e.lesson_type === "new" ? sum + (e.lines ?? 0) : sum), 0);
  return linesToPages(lines);
}

export function isBelowMinimum(e: Pick<Entry, "absent" | "lesson_type" | "pages">) {
  return !e.absent && e.lesson_type === "new" && e.pages !== null && e.pages < MAAHAD_MIN_PAGES;
}

const DAY = 86_400_000;
const toMs = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const daysBetween = (from: string, to: string) => Math.round((toMs(to) - toMs(from)) / DAY);
const addDays = (iso: string, n: number) => new Date(toMs(iso) + n * DAY).toISOString().slice(0, 10);

export type Pace = {
  expected: number; // pages the student should have by today
  diff: number; // memorised − expected (negative = behind)
  onTrack: boolean;
  projectedFinish: string | null; // null when nothing memorised yet or already complete
  afterYearEnd: boolean;
};

// Full Qur'an in one academic year: expected pages grow evenly over the calendar days of the year.
export function maahadPace(a: { memorised: number; yearStart: string; yearEnd: string; today: string }): Pace {
  const yearDays = daysBetween(a.yearStart, a.yearEnd) + 1;
  const elapsed = Math.min(Math.max(daysBetween(a.yearStart, a.today) + 1, 1), yearDays);
  const expected = round2((TOTAL_PAGES * elapsed) / yearDays);

  let projectedFinish: string | null = null;
  if (a.memorised > 0 && a.memorised < TOTAL_PAGES) {
    const daysNeeded = Math.ceil(TOTAL_PAGES / (a.memorised / elapsed));
    projectedFinish = addDays(a.yearStart, daysNeeded - 1);
  }

  return {
    expected,
    diff: round2(a.memorised - expected),
    onTrack: a.memorised >= expected * PACE_TOLERANCE,
    projectedFinish,
    afterYearEnd: projectedFinish !== null && projectedFinish > a.yearEnd,
  };
}
