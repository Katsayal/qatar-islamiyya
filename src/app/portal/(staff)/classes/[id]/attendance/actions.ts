"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { STATUSES, type Status } from "@/lib/attendance";
import { requireClassAccess } from "@/lib/class-access";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

export type Result = { ok: boolean; message: string | null };
const fail = (message: string): Result => ({ ok: false, message });

const base = z.object({
  class_id: z.string().uuid(),
  att_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v),
});
const status = z.enum(STATUSES.map((s) => s.value) as [Status, ...Status[]]);

// Saves the whole roll call for one day. Existing rows for that day are updated, not duplicated.
export async function saveAttendance(_prev: Result, formData: FormData): Promise<Result> {
  const profile = await requireRole("teacher", "staff");
  const b = base.safeParse(Object.fromEntries(formData));
  if (!b.success) return fail("Check the date.");
  const { class_id, att_date } = b.data;
  if (att_date > todayInLagos()) return fail("The date cannot be in the future.");
  await requireClassAccess(profile, class_id);

  const supabase = await createClient();
  const [{ data: c }, { data: students }, { data: termId, error: termError }] = await Promise.all([
    supabase.from("classes").select("program").eq("id", class_id).maybeSingle(),
    supabase.from("students").select("id").eq("class_id", class_id).eq("status", "active"),
    supabase.rpc("term_for_date", { d: att_date }),
  ]);
  if (c?.program !== "barnamaj") return fail("Attendance is only taken for Barnamaj.");
  if (!students?.length) return fail("This class has no active students.");
  if (termError || !termId) return fail("No term covers that date. Ask staff to set up term dates.");

  // Only students of this class are saved; any other ids in the form are ignored.
  const rows = [];
  const counts: Record<Status, number> = { present: 0, absent: 0, excused: 0 };
  for (const s of students) {
    const st = status.safeParse(formData.get(`status_${s.id}`));
    if (!st.success) return fail("Choose a status for every student.");
    counts[st.data]++;
    // term_id / recorded_by are set again by a database trigger; the insert type needs them.
    rows.push({ student_id: s.id, term_id: termId, att_date, status: st.data, recorded_by: profile.id });
  }

  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,att_date" });
  if (error) return fail("Could not save. Try again.");

  revalidatePath("/portal/classes", "layout");
  return { ok: true, message: `Saved: ${counts.present} present, ${counts.absent} absent, ${counts.excused} excused.` };
}
