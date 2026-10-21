import { gregorianDate, hausaWeekday, hijriDate, type HijriOffset } from "@/lib/hijri";

// Hijri date on top, Gregorian date smaller underneath (SPEC §11a). No hooks: works in server and client components.
// With `weekday`: "Laraba, 10 Jimada Ula 1448 AH" over "Wednesday 21 October 2026".
export function DualDate({
  iso,
  offsets,
  lang = "en",
  style = "long",
  weekday = false,
  className,
  subClassName = "text-muted-foreground",
}: {
  iso: string;
  offsets: HijriOffset[];
  lang?: "en" | "ar";
  style?: "long" | "medium";
  weekday?: boolean;
  className?: string;
  subClassName?: string;
}) {
  const hijri = hijriDate(iso, offsets, lang);
  return (
    <span className={`flex flex-col ${className ?? ""}`}>
      <span>{weekday && lang === "en" ? `${hausaWeekday(iso)}, ${hijri}` : hijri}</span>
      <span className={`text-[0.85em] ${subClassName}`}>{gregorianDate(iso, lang, style, weekday && lang === "en")}</span>
    </span>
  );
}
