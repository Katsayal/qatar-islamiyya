"use client";

import { Check } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { controlClass } from "@/components/form-parts";
import { DualDate } from "@/components/dual-date";
import type { HijriOffset } from "@/lib/hijri";
import { saveHijriOffset } from "./actions";
import { Message } from "./message";

const SHIFTS = [-2, -1, 0, 1, 2];
const shiftLabel = (d: number) => (d === 0 ? "No shift (Umm al-Qura)" : `${d > 0 ? "+" : "−"}${Math.abs(d)} day${Math.abs(d) > 1 ? "s" : ""}`);

// "From this date, shift by N days", with a live preview of that date (computed here in the browser).
export function HijriForm({ today, offsets }: { today: string; offsets: HijriOffset[] }) {
  const [result, formAction, pending] = useActionState(saveHijriOffset, null);
  const [date, setDate] = useState(today);
  const [days, setDays] = useState(0);
  // The preview pretends this change is already saved: it replaces any change on the same date.
  const preview = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? [...offsets.filter((o) => o.starts_on !== date), { starts_on: date, days }]
    : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1 text-sm">
        From date
        <input name="starts_on" type="date" required defaultValue={today} onChange={(e) => setDate(e.target.value)} className={controlClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Shift
        <select name="days" defaultValue={0} onChange={(e) => setDays(Number(e.target.value))} className={controlClass}>
          {SHIFTS.map((d) => (
            <option key={d} value={d}>
              {shiftLabel(d)}
            </option>
          ))}
        </select>
      </label>
      {preview && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="text-xs text-muted-foreground">That date will show as</p>
          <DualDate iso={date} offsets={preview} weekday className="mt-1 font-medium" />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Use this when the month starts on a different day in Nigeria than in the Umm al-Qura calendar. Pick the day the change starts
        (usually the 1st of the new month), then the shift that makes the preview match the announced date. Dates before it are not changed.
      </p>
      <Message result={result} />
      <button disabled={pending} className={cn(btn.save, big)}>
        <Check aria-hidden /> {pending ? "Saving…" : "Save Hijri date change"}
      </button>
    </form>
  );
}
