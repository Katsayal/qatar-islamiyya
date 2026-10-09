"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { amountForPages, amountForRange, swapIfReversed, TOTAL_PAGES, type Amount } from "@/lib/quran";
import { createClient } from "@/lib/supabase/server";
import { surahs } from "@/lib/surahs";
import { todayInLagos } from "@/lib/today";

export type Result = { ok: boolean; message: string | null };
const fail = (message: string): Result => ({ ok: false, message });

const base = z.object({
  student_id: z.string().uuid(),
  entry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v),
  absent: z.string().optional().transform((v) => v === "on"),
  note: z.string().trim().max(300).transform((v) => v || null),
});

const recitation = z.object({
  lesson_type: z.enum(["new", "murajaah"]),
  grade: z.enum(["jayyid", "jayyid_jiddan", "mumtaz"]),
  mode: z.enum(["ayah", "page"]),
});

const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max);
const ayahRange = z.object({
  start_surah: int(1, 114),
  start_ayah: int(1, 286),
  end_surah: int(1, 114),
  end_ayah: int(1, 286),
});
const pageRange = z.object({ start_page: int(1, TOTAL_PAGES), end_page: int(1, TOTAL_PAGES) });

type Range = { start_surah: number; start_ayah: number; end_surah: number; end_ayah: number };

export async function saveHifz(_prev: Result, formData: FormData): Promise<Result> {
  const profile = await requireRole("teacher", "staff");
  const raw = Object.fromEntries(formData);

  const b = base.safeParse(raw);
  if (!b.success) return fail("Check the date and note.");
  if (b.data.entry_date > todayInLagos()) return fail("The date cannot be in the future.");

  const supabase = await createClient();
  const { student_id, entry_date, absent, note } = b.data;

  // class_id / term_id / teacher_id are set again by a database trigger; the insert type needs them.
  const [{ data: student }, { data: termId, error: termError }] = await Promise.all([
    supabase.from("students").select("class_id, classes(program)").eq("id", student_id).maybeSingle(),
    supabase.rpc("term_for_date", { d: entry_date }),
  ]);
  if (!student?.class_id) return fail("Student not found.");
  const program = student.classes?.program;
  if (program !== "tahfiz" && program !== "maahad") return fail("Hifz is only recorded for Tahfiz and Ma'ahad.");
  if (termError || !termId) return fail("No term covers that date. Ask staff to set up term dates.");
  const context = { student_id, class_id: student.class_id, term_id: termId, teacher_id: profile.id, entry_date, note };

  if (absent) {
    const { error } = await supabase.from("hifz_entries").insert({ ...context, absent: true });
    if (error) return fail("Could not save. Try again.");
    revalidatePath("/portal/classes", "layout");
    return { ok: true, message: "Marked absent." };
  }

  const r = recitation.safeParse(raw);
  if (!r.success) return fail("Choose the lesson type and the grade.");

  let range: Range;
  let amount: Amount;
  if (r.data.mode === "ayah") {
    const a = ayahRange.safeParse(raw);
    if (!a.success) return fail("Enter the surah and ayah numbers.");
    for (const [s, n] of [[a.data.start_surah, a.data.start_ayah], [a.data.end_surah, a.data.end_ayah]]) {
      if (n > surahs[s - 1].ayahs) return fail(`${surahs[s - 1].name} has only ${surahs[s - 1].ayahs} ayahs.`);
    }
    const [from, to] = swapIfReversed(
      { surah: a.data.start_surah, ayah: a.data.start_ayah },
      { surah: a.data.end_surah, ayah: a.data.end_ayah },
    );
    const cols = "surah, ayah, page, line, end_page, end_line";
    const [{ data: first }, { data: last }] = await Promise.all([
      supabase.from("quran_ayahs").select(cols).eq("surah", from.surah).eq("ayah", from.ayah).maybeSingle(),
      supabase.from("quran_ayahs").select(cols).eq("surah", to.surah).eq("ayah", to.ayah).maybeSingle(),
    ]);
    if (!first || !last) return fail("Could not find that ayah.");
    range = { start_surah: from.surah, start_ayah: from.ayah, end_surah: to.surah, end_ayah: to.ayah };
    amount = amountForRange(first, last);
  } else {
    const p = pageRange.safeParse(raw);
    if (!p.success) return fail(`Enter pages between 1 and ${TOTAL_PAGES}.`);
    const [startPage, endPage] = [Math.min(p.data.start_page, p.data.end_page), Math.max(p.data.start_page, p.data.end_page)];
    // The DB needs surah/ayah too: the ayah covering the top of the first page … the last ayah that starts by the last page.
    const [{ data: first }, { data: last }] = await Promise.all([
      supabase.from("quran_ayahs").select("surah, ayah").gte("end_page", startPage).order("surah").order("ayah").limit(1).maybeSingle(),
      supabase.from("quran_ayahs").select("surah, ayah").lte("page", endPage).order("surah", { ascending: false }).order("ayah", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (!first || !last) return fail("Could not find those pages.");
    range = { start_surah: first.surah, start_ayah: first.ayah, end_surah: last.surah, end_ayah: last.ayah };
    amount = amountForPages(startPage, endPage);
  }

  const { error } = await supabase.from("hifz_entries").insert({
    ...context,
    absent: false,
    lesson_type: r.data.lesson_type,
    grade: r.data.grade,
    ...range,
    start_page: amount.start_page,
    end_page: amount.end_page,
    pages: amount.pages,
    lines: amount.lines,
  });
  if (error) return fail("Could not save. Try again.");

  revalidatePath("/portal/classes", "layout");
  const short = program === "maahad" && r.data.lesson_type === "new" && amount.pages < 2;
  return { ok: true, message: `Saved: ${amount.pages} pages (${amount.lines} lines).${short ? " Warning: below the 2-page Ma'ahad minimum." : ""}` };
}
