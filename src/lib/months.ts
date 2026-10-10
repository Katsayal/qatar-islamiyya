// Month helpers for the salary pages. Pure, so `npm test` can run them.
// A month is "YYYY-MM" in the URL and the month picker, and the first day of the month ("YYYY-MM-01") in the database.

// "2026-10" -> "2026-10-01"; anything that is not a real month -> null.
export function monthStart(ym: string): string | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(ym.trim());
  return m ? `${m[1]}-${m[2]}-01` : null;
}

// "2026-10-10" (today's date) -> "2026-10"
export const currentMonth = (todayIso: string) => todayIso.slice(0, 7);

// "2026-10" -> "October 2026"
export function monthLabel(ym: string): string {
  const start = monthStart(ym);
  if (!start) return ym;
  return new Date(`${start}T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}
