"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { moveToClasses } from "@/lib/move-students";
import { studentSchema as schema } from "@/lib/student-schema";
import { createClient } from "@/lib/supabase/server";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO = 2 * 1024 * 1024;

// Returns an error message, or redirects to the list on success.
export async function saveStudent(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");

  const id = String(formData.get("id") || "") || undefined;
  const get = (k: string) => String(formData.get(k) ?? "");
  const parsed = schema.safeParse({
    ...Object.fromEntries(formData),
    date_of_birth: get("date_of_birth") || null,
    admitted_on: get("admitted_on") || null,
    class_id: get("class_id") || null,
    entry_level: get("entry_level") || null,
    status: get("status") || "active",
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "guardian_phone" || field === "student_phone") {
      return "Phone numbers must be Nigerian numbers, e.g. 08012345678.";
    }
    return "Please check the form: admission number, name, gender, date of birth, blood group, address, local government and previous Islamiyya are required.";
  }

  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto && (!PHOTO_TYPES.includes(photo.type) || photo.size > MAX_PHOTO)) {
    return "The photo must be a JPG, PNG or WebP image of at most 2 MB.";
  }

  const supabase = await createClient();
  const studentId = id ?? crypto.randomUUID();
  const photoPath = `students/${studentId}.jpg`;

  if (hasPhoto) {
    const { error } = await supabase.storage
      .from("student-photos")
      .upload(photoPath, photo, { contentType: photo.type, upsert: true });
    if (error) return "Could not upload the photo. Please try again.";
  }

  const row = { ...parsed.data, ...(hasPhoto ? { photo_path: photoPath } : {}) };
  const { error } = id
    ? await supabase.from("students").update(row).eq("id", id)
    : await supabase.from("students").insert({ id: studentId, ...row });

  if (error) {
    if (hasPhoto && !id) await supabase.storage.from("student-photos").remove([photoPath]);
    return error.code === "23505"
      ? "This admission number is already used."
      : "Could not save the student.";
  }

  revalidatePath("/portal/students");
  redirect("/portal/students");
}

// Archive / restore. Bound with the student id and the new status in the page.
export async function setStatus(id: string, status: "active" | "archived") {
  await requireRole("staff");
  const supabase = await createClient();
  await supabase.from("students").update({ status }).eq("id", id);
  revalidatePath("/portal/students");
  redirect("/portal/students");
}

// Hard delete (mistakes only). The admission number must be typed to confirm.
export async function deleteStudent(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return "Student not found.";

  const supabase = await createClient();
  const { data: s } = await supabase
    .from("students")
    .select("admission_no, photo_path")
    .eq("id", id.data)
    .maybeSingle();
  if (!s) return "Student not found.";
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== s.admission_no) {
    return "The admission number does not match. Nothing was deleted.";
  }

  const { error } = await supabase.from("students").delete().eq("id", id.data);
  if (error) return "Could not delete the student.";
  if (s.photo_path) await supabase.storage.from("student-photos").remove([s.photo_path]);

  revalidatePath("/portal/students");
  redirect("/portal/students");
}

const moveSchema = z.object({
  to: z.string().uuid("Please choose a class."),
  ids: z.array(z.string().uuid()).min(1, "Tick at least one student.").max(200, "Move at most 200 students at a time."),
});

export type MoveResult = { ok: boolean; message: string } | null;

// Students list: move the ticked students to one class (only the class changes).
export async function moveStudents(_prev: MoveResult, formData: FormData): Promise<MoveResult> {
  await requireRole("staff");
  const parsed = moveSchema.safeParse({ to: String(formData.get("to") ?? ""), ids: formData.getAll("student") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { to, ids } = parsed.data;

  const supabase = await createClient();
  const { data: target } = await supabase.from("classes").select("name").eq("id", to).eq("active", true).maybeSingle();
  if (!target) return { ok: false, message: "That class is not active." };

  const { moved, error } = await moveToClasses(supabase, new Map([[to, ids]]));
  if (error) return { ok: false, message: error };
  return { ok: true, message: `Moved ${moved} student${moved === 1 ? "" : "s"} to ${target.name}.` };
}
