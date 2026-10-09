"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: boolean; message: string | null };
const fail = (message: string): Result => ({ ok: false, message });

// Saves every filled mark for one book and term. Empty boxes are left untouched.
export async function saveMarks(_prev: Result, formData: FormData): Promise<Result> {
  const profile = await requireRole("teacher", "staff");
  const ids = z.object({ book_id: z.string().uuid(), term_id: z.string().uuid() }).safeParse(Object.fromEntries(formData));
  if (!ids.success) return fail("Check the book and term.");
  const { book_id, term_id } = ids.data;

  const supabase = await createClient();
  const { data: book } = await supabase.from("books").select("teacher_id").eq("id", book_id).maybeSingle();
  if (!book || (profile.role === "teacher" && book.teacher_id !== profile.id)) return fail("This book is not assigned to you.");

  // Only active Barnamaj students are saved; any other ids in the form are ignored.
  const { data: classes } = await supabase.from("classes").select("id").eq("program", "barnamaj");
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("status", "active")
    .in("class_id", (classes ?? []).map((c) => c.id));

  const rows = [];
  for (const s of students ?? []) {
    const raw = String(formData.get(`score_${s.id}`) ?? "").trim();
    if (!raw) continue;
    const score = Number(raw);
    if (!/^\d{1,3}$/.test(raw) || score > 100) return fail(`${s.full_name}: marks must be a whole number from 0 to 100.`);
    // entered_by is set again by a database trigger; the insert type needs it.
    rows.push({ student_id: s.id, book_id, term_id, score, entered_by: profile.id });
  }
  if (!rows.length) return fail("Enter at least one mark.");

  const { error } = await supabase.from("exam_results").upsert(rows, { onConflict: "student_id,book_id,term_id" });
  if (error) return fail("Could not save the marks.");

  revalidatePath(`/portal/books/${book_id}`);
  return { ok: true, message: `Saved ${rows.length} mark${rows.length === 1 ? "" : "s"}.` };
}
