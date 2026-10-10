"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CorrectionResult = { ok: boolean; message: string } | null;

const MAX_OPEN = 3;
const schema = z.object({
  message: z.string().trim().min(5, "Please explain what is wrong (at least 5 characters).").max(500, "Please keep it under 500 characters."),
});

export async function requestCorrection(_prev: CorrectionResult, formData: FormData): Promise<CorrectionResult> {
  await requireRole("student");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };

  const supabase = await createClient();
  // RLS: a student only sees their own student row and their own requests.
  const { data: student } = await supabase.from("students").select("id").maybeSingle();
  if (!student) return { ok: false, message: "Your student record is not linked yet. Please ask the office." };

  const { count } = await supabase
    .from("correction_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  if ((count ?? 0) >= MAX_OPEN) {
    return { ok: false, message: `You already have ${MAX_OPEN} open requests. Please wait until the office handles them.` };
  }

  const { error } = await supabase.from("correction_requests").insert({ student_id: student.id, message: parsed.data.message });
  if (error) return { ok: false, message: "Could not send your request. Please try again." };

  revalidatePath("/portal/student/profile");
  return { ok: true, message: "Request sent. The office will look at it." };
}

export type PasswordResult = { ok: boolean; message: string } | null;

const passwordSchema = z
  .object({
    password: z.string().min(6, "The password needs at least 6 characters.").max(72, "The password is too long."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords do not match.", path: ["confirm"] });

// A student sets their own password (plain, min 6). Uses their own session, not the admin key.
// The flag in user_metadata switches off the reminder on the dashboard; a staff reset clears it again.
export async function changePassword(_prev: PasswordResult, formData: FormData): Promise<PasswordResult> {
  await requireRole("student");
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password, data: { password_changed: true } });
  if (error) return { ok: false, message: "Could not change the password. Please try again." };
  await supabase.auth.refreshSession(); // so the flag is in the next token

  revalidatePath("/portal/student");
  return { ok: true, message: "Password changed. Use it the next time you sign in." };
}
