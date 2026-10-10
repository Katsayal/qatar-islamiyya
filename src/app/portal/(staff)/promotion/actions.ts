"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  from: z.string().uuid(),
  to: z.string().uuid().or(z.literal("graduate")),
  ids: z.array(z.string().uuid()).min(1, "Tick at least one student.").max(200, "Move at most 200 students at a time."),
});

export type PromoteResult = { ok: boolean; message: string } | null;

export async function promoteStudents(_prev: PromoteResult, formData: FormData): Promise<PromoteResult> {
  await requireRole("staff");
  const parsed = schema.safeParse({
    from: formData.get("from"),
    to: formData.get("to"),
    ids: formData.getAll("student"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue.path[0] === "to" ? "Please choose where the students go." : issue.message };
  }
  const { from, to, ids } = parsed.data;
  if (to === from) return { ok: false, message: "Choose a different class from the one you are moving out of." };

  const supabase = await createClient();
  let target: { name: string } | null = null;
  if (to !== "graduate") {
    const { data } = await supabase.from("classes").select("name").eq("id", to).eq("active", true).maybeSingle();
    if (!data) return { ok: false, message: "That class is not active." };
    target = data;
  }

  // Only rows that are still active in the source class change, so a stale form cannot move anyone else.
  const { data: moved, error } = await supabase
    .from("students")
    .update(to === "graduate" ? { status: "graduated" } : { class_id: to })
    .in("id", ids)
    .eq("class_id", from)
    .eq("status", "active")
    .select("id");
  if (error) return { ok: false, message: "Could not move the students." };

  revalidatePath("/portal/promotion");
  revalidatePath("/portal/students");
  revalidatePath("/portal");

  const n = moved?.length ?? 0;
  if (n === 0) return { ok: false, message: "Nobody was moved: these students are no longer active in this class." };
  const who = `${n} student${n === 1 ? "" : "s"}`;
  return { ok: true, message: target ? `Moved ${who} to ${target.name}.` : `${who} graduated.` };
}
