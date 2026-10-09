"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(80),
    name_ar: z.string().trim().max(80).transform((v) => v || null),
    program: z.enum(["tahfiz", "maahad", "barnamaj"]),
    level: z.string().trim().transform((v) => (v ? Number(v) : null)).pipe(z.number().int().min(1).max(20).nullable()),
    hifz_unit: z.enum(["lines", "pages"]).nullable(),
    sort_order: z.string().trim().transform((v) => Number(v || 0)).pipe(z.number().int()),
    active: z.boolean(),
    teacher_ids: z.array(z.string().uuid()),
  })
  .refine((v) => v.program === "barnamaj" || v.program === "maahad" || v.hifz_unit, {
    message: "Choose the hifz unit (lines or pages) for a Tahfiz class.",
    path: ["hifz_unit"],
  })
  .refine((v) => v.program === "barnamaj" || v.teacher_ids.length <= 1, {
    message: "A Tahfiz or Ma'ahad class has one teacher. Barnamaj can have several.",
    path: ["teacher_ids"],
  });

export async function saveClass(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");

  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    name_ar: formData.get("name_ar") ?? "",
    program: formData.get("program"),
    level: formData.get("level") ?? "",
    hifz_unit: formData.get("hifz_unit") || null,
    sort_order: formData.get("sort_order") ?? "",
    active: formData.get("active") === "on",
    teacher_ids: formData.getAll("teacher_ids"),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check the form.";

  const { id, teacher_ids, ...v } = parsed.data;
  // Ma'ahad is always pages; Barnamaj has no hifz unit or level; only Tahfiz has levels.
  const row = {
    ...v,
    hifz_unit: v.program === "maahad" ? "pages" : v.program === "barnamaj" ? null : v.hifz_unit,
    level: v.program === "tahfiz" ? v.level : null,
  };

  const supabase = await createClient();
  let classId = id;
  if (classId) {
    const { error } = await supabase.from("classes").update(row).eq("id", classId);
    if (error) return "Could not save the class.";
  } else {
    const { data, error } = await supabase.from("classes").insert(row).select("id").single();
    if (error) return "Could not save the class.";
    classId = data.id;
  }

  // Replace the teacher assignments.
  const { error: delError } = await supabase.from("class_teachers").delete().eq("class_id", classId);
  if (delError) return "Could not update the teachers.";
  if (teacher_ids.length) {
    const { error } = await supabase
      .from("class_teachers")
      .insert(teacher_ids.map((teacher_id) => ({ class_id: classId!, teacher_id })));
    if (error) return "Could not update the teachers.";
  }

  revalidatePath("/portal/academic/classes");
  redirect("/portal/academic/classes");
}
