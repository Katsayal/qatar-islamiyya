"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const schema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(3).max(20),
    starts_on: date,
    term1_end: date,
    term2_end: date,
    term3_end: date,
  })
  .refine((v) => v.starts_on < v.term1_end && v.term1_end < v.term2_end && v.term2_end < v.term3_end, {
    message: "Dates must be in order: start, then the end of term 1, 2 and 3.",
  });

export type YearState = { ok: boolean; error: string | null };

function addDay(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Terms are derived from the year start and the three end dates, so there can be no gaps.
function termRanges(v: { starts_on: string; term1_end: string; term2_end: string; term3_end: string }) {
  return [
    { number: 1, starts_on: v.starts_on, ends_on: v.term1_end },
    { number: 2, starts_on: addDay(v.term1_end), ends_on: v.term2_end },
    { number: 3, starts_on: addDay(v.term2_end), ends_on: v.term3_end },
  ];
}

function dbMessage(code?: string) {
  if (code === "23505") return "An academic year with this name already exists.";
  if (code === "23P01") return "These dates overlap another academic year.";
  return "Could not save the academic year.";
}

export async function saveYear(_prev: YearState, formData: FormData): Promise<YearState> {
  await requireRole("staff");

  const parsed = schema.safeParse({ ...Object.fromEntries(formData), id: formData.get("id") || undefined });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const v = parsed.data;
  const ranges = termRanges(v);
  const supabase = await createClient();

  if (!v.id) {
    const { data: year, error } = await supabase
      .from("academic_years")
      .insert({ name: v.name, starts_on: v.starts_on, ends_on: v.term3_end })
      .select("id")
      .single();
    if (error) return { ok: false, error: dbMessage(error.code) };

    const { error: termError } = await supabase
      .from("terms")
      .insert(ranges.map((r) => ({ ...r, academic_year_id: year.id })));
    if (termError) {
      await supabase.from("academic_years").delete().eq("id", year.id);
      return { ok: false, error: dbMessage(termError.code) };
    }
  } else {
    const { data: old } = await supabase
      .from("terms")
      .select("id, number, starts_on, ends_on")
      .eq("academic_year_id", v.id)
      .order("number");
    if (!old || old.length !== 3) return { ok: false, error: "Could not load this year's terms." };

    const { error } = await supabase
      .from("academic_years")
      .update({ name: v.name, starts_on: v.starts_on, ends_on: v.term3_end })
      .eq("id", v.id);
    if (error) return { ok: false, error: dbMessage(error.code) };

    // The terms table rejects overlaps row by row, so park the terms in far-off dates first,
    // then set the final dates. On failure, put the old dates back.
    const setTerm = (id: string, starts_on: string, ends_on: string) =>
      supabase.from("terms").update({ starts_on, ends_on }).eq("id", id);
    for (const t of old) await setTerm(t.id, `${9000 + t.number}-01-01`, `${9000 + t.number}-01-02`);
    for (const t of old) {
      const r = ranges[t.number - 1];
      const { error: termError } = await setTerm(t.id, r.starts_on, r.ends_on);
      if (termError) {
        for (const o of old) await setTerm(o.id, o.starts_on, o.ends_on);
        return { ok: false, error: dbMessage(termError.code) };
      }
    }
  }

  revalidatePath("/portal/academic");
  return { ok: true, error: null };
}
