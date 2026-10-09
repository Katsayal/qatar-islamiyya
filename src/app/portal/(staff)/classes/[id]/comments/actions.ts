"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { requireClassAccess } from "@/lib/class-access";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: boolean; message: string | null };
const fail = (message: string): Result => ({ ok: false, message });

const MAX_COMMENT = 600; // keep in step with comments/page.tsx

// Saves the comments that changed for one class and term. Empty boxes are left untouched.
export async function saveComments(_prev: Result, formData: FormData): Promise<Result> {
  const profile = await requireRole("teacher", "staff");
  const ids = z.object({ class_id: z.string().uuid(), term_id: z.string().uuid() }).safeParse(Object.fromEntries(formData));
  if (!ids.success) return fail("Check the class and term.");
  const { class_id, term_id } = ids.data;
  await requireClassAccess(profile, class_id);

  // Only active students of this class are saved; any other ids in the form are ignored.
  const supabase = await createClient();
  const [{ data: students }, { data: saved }] = await Promise.all([
    supabase.from("students").select("id, full_name").eq("class_id", class_id).eq("status", "active"),
    supabase.from("report_comments").select("student_id, comment").eq("term_id", term_id),
  ]);
  const before = new Map((saved ?? []).map((c) => [c.student_id, c.comment]));

  const rows = [];
  for (const s of students ?? []) {
    const text = String(formData.get(`comment_${s.id}`) ?? "").trim();
    if (!text || text === before.get(s.id)) continue;
    if (text.length > MAX_COMMENT) return fail(`${s.full_name}: the comment is longer than ${MAX_COMMENT} characters.`);
    // teacher_id is set again by a database trigger (and kept on update); the insert type needs it.
    rows.push({ student_id: s.id, term_id, comment: text, teacher_id: profile.id });
  }
  if (!rows.length) return { ok: true, message: "Nothing changed." };

  const { error } = await supabase.from("report_comments").upsert(rows, { onConflict: "student_id,term_id" });
  if (error) return fail("Could not save the comments.");

  revalidatePath(`/portal/classes/${class_id}/comments`);
  return { ok: true, message: `Saved ${rows.length} comment${rows.length === 1 ? "" : "s"}.` };
}
