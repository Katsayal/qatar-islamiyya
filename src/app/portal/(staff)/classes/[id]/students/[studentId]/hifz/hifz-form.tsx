"use client";

import { startTransition, useActionState, useState } from "react";
import { surahs } from "@/lib/surahs";
import { saveHifz, type Result } from "./actions";
import { controlClass } from "@/components/form-parts";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { DualDate } from "@/components/dual-date";
import type { HijriOffset } from "@/lib/hijri";

const input = controlClass;
const label = "flex flex-col gap-1 text-sm";

function AyahPicker({ prefix, title }: { prefix: "start" | "end"; title: string }) {
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="mb-1 text-sm">{title}</legend>
      <select name={`${prefix}_surah`} defaultValue="" required aria-label={`${title} surah`} className={`${input} col-span-2`}>
        <option value="" disabled>Surah</option>
        {surahs.map((s) => (
          <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
        ))}
      </select>
      <input name={`${prefix}_ayah`} type="number" min={1} inputMode="numeric" required placeholder="Ayah" aria-label={`${title} ayah`} className={input} />
    </fieldset>
  );
}

export function HifzForm({
  studentId,
  today,
  defaultMode,
  offsets,
}: {
  studentId: string;
  today: string;
  defaultMode: "ayah" | "page";
  offsets: HijriOffset[];
}) {
  const [state, formAction, pending] = useActionState<Result, FormData>(saveHifz, { ok: false, message: null });
  const [absent, setAbsent] = useState(false);
  const [mode, setMode] = useState(defaultMode);
  const [date, setDate] = useState(today);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="grid gap-4"
    >
      <input type="hidden" name="student_id" value={studentId} />
      <label className={label}>
        Date
        <input name="entry_date" type="date" required max={today} defaultValue={today} onChange={(e) => setDate(e.target.value)} className={input} />
        {/^\d{4}-\d{2}-\d{2}$/.test(date) && <DualDate iso={date} offsets={offsets} weekday className="font-semibold" />}
      </label>

      <label className="flex h-11 items-center gap-3 text-base">
        <input name="absent" type="checkbox" checked={absent} onChange={(e) => setAbsent(e.target.checked)} className="size-5" />
        Absent today
      </label>

      {!absent && (
        <>
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-1 text-sm">Lesson</legend>
            {[["new", "New hifz"], ["murajaah", "Muraja'ah"]].map(([v, text], i) => (
              <label key={v} className="flex h-11 items-center gap-2 rounded-lg border px-3 has-[:checked]:border-primary has-[:checked]:bg-muted bg-card">
                <input type="radio" name="lesson_type" value={v} required defaultChecked={i === 0} />
                {text}
              </label>
            ))}
          </fieldset>

          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-1 text-sm">Enter range</legend>
            {[["ayah", "By ayah"], ["page", "By page"]].map(([v, text]) => (
              <label key={v} className="flex h-11 items-center gap-2 rounded-lg border px-3 has-[:checked]:border-primary has-[:checked]:bg-muted bg-card">
                <input type="radio" name="mode" value={v} checked={mode === v} onChange={() => setMode(v as "ayah" | "page")} />
                {text}
              </label>
            ))}
          </fieldset>

          {mode === "ayah" ? (
            <>
              <AyahPicker prefix="start" title="From" />
              <AyahPicker prefix="end" title="To" />
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label className={label}>
                From page
                <input name="start_page" type="number" min={1} max={604} inputMode="numeric" required className={input} />
              </label>
              <label className={label}>
                To page
                <input name="end_page" type="number" min={1} max={604} inputMode="numeric" required className={input} />
              </label>
            </div>
          )}

          <fieldset className="grid grid-cols-3 gap-2">
            <legend className="mb-1 text-sm">Grade</legend>
            {[["jayyid", "Jayyid"], ["jayyid_jiddan", "Jayyid Jiddan"], ["mumtaz", "Mumtaz"]].map(([v, text]) => (
              <label key={v} className="flex min-h-11 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-center text-sm has-[:checked]:border-primary has-[:checked]:bg-muted bg-card">
                <input type="radio" name="grade" value={v} required className="sr-only" />
                {text}
              </label>
            ))}
          </fieldset>
        </>
      )}

      <label className={label}>
        Note (optional)
        <input name="note" maxLength={300} className={input} />
      </label>

      <button disabled={pending} className={cn(btn.save, big)}>
        <Check aria-hidden /> {pending ? "Saving…" : "Save"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-lg border p-3 text-sm ${state.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
