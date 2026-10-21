// Hijri dates (docs/SPEC.md §11a). Umm al-Qura from the built-in Intl calendar, shifted by the staff-set offset
// (table hijri_offsets) so it matches Nigeria's moon sighting. No imports: also used in client forms.
// Every date is an ISO day ("2026-10-21") handled as UTC midnight, so no time zone can move it.

export type HijriOffset = { starts_on: string; days: number };
type DateLang = "en" | "ar";

// Hausa spelling of the month names (English pages and the portals).
export const HAUSA_MONTHS = [
  "Muharram", "Safar", "Rabi'ul Awwal", "Rabi'ul Akhir", "Jimada Ula", "Jimada Akhir",
  "Rajab", "Sha'aban", "Ramadan", "Shawwal", "Zul Ki'ida", "Zul Hajji",
];
const HAUSA_WEEKDAYS = ["Lahadi", "Litinin", "Talata", "Laraba", "Alhamis", "Juma'a", "Asabar"];

const toUtc = (iso: string) => new Date(`${iso}T00:00:00Z`);

// The offset in force on a date: the latest change on or before it, 0 before the first change.
export function offsetFor(iso: string, offsets: HijriOffset[]) {
  let best: HijriOffset | null = null;
  for (const o of offsets) if (o.starts_on <= iso && (!best || o.starts_on > best.starts_on)) best = o;
  return best?.days ?? 0;
}

const enParts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" });
const arFormat = new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// "10 Jimada Ula 1448 AH" (en) or "10 جمادى الأولى 1448 هـ" (ar).
export function hijriDate(iso: string, offsets: HijriOffset[], lang: DateLang = "en") {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + offsetFor(iso, offsets));
  if (lang === "ar") return arFormat.format(d);
  const part = (type: string) => Number(enParts.formatToParts(d).find((p) => p.type === type)?.value);
  return `${part("day")} ${HAUSA_MONTHS[part("month") - 1]} ${part("year")} AH`;
}

// Weekday of the real (Gregorian) day, in Hausa: "Talata".
export const hausaWeekday = (iso: string) => HAUSA_WEEKDAYS[toUtc(iso).getUTCDay()];

// "21 October 2026" (long), "21 Oct 2026" (medium), "Tuesday 21 October 2026" (weekday) or "21 أكتوبر 2026" (ar).
export function gregorianDate(iso: string, lang: DateLang = "en", style: "long" | "medium" = "long", weekday = false) {
  const d = toUtc(iso);
  if (lang === "ar") return d.toLocaleDateString("ar-u-nu-latn", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const date = d.toLocaleDateString("en-GB", { dateStyle: style, timeZone: "UTC" });
  return weekday ? `${d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" })} ${date}` : date;
}
