"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { admissionToEmail, requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: boolean; message: string | null };

// Plain passwords, no strength rules (CLAUDE.md); 6 is Supabase's own minimum.
const password = z.string().min(6, "The password needs at least 6 characters.").max(72);
const fail = (message: string): Result => ({ ok: false, message });
const done = (message: string): Result => ({ ok: true, message });

// Everything here runs on the server. The service-role client is used only below,
// after requireRole; who may do what is also enforced by RLS on profiles.

export async function createStudentLogin(_prev: Result, formData: FormData): Promise<Result> {
  await requireRole("staff");
  const parsed = z.object({ studentId: z.string().uuid(), password }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Enter a password.");

  const supabase = await createClient();
  const { data: s } = await supabase
    .from("students")
    .select("admission_no, full_name, user_id")
    .eq("id", parsed.data.studentId)
    .maybeSingle();
  if (!s) return fail("Student not found.");
  if (s.user_id) return fail("This student already has a login.");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: admissionToEmail(s.admission_no),
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "student", full_name: s.full_name }, // read by the handle_new_user trigger
  });
  if (error) {
    return fail(error.code === "email_exists" ? "A login for this admission number already exists." : "Could not create the login.");
  }

  const { error: linkError } = await supabase
    .from("students")
    .update({ user_id: data.user.id })
    .eq("id", parsed.data.studentId);
  if (linkError) {
    await admin.auth.admin.deleteUser(data.user.id); // no orphan login
    return fail("Could not link the login to the student. Nothing was saved.");
  }

  revalidatePath("/portal/accounts");
  return done(`Login created. The student signs in with admission number ${s.admission_no} and the password you set.`);
}

export async function createStaffAccount(_prev: Result, formData: FormData): Promise<Result> {
  const me = await requireRole("staff");
  if (!me.is_owner) return fail("Only the owner can create teacher and staff accounts.");

  const parsed = z
    .object({
      full_name: z.string().trim().min(2).max(120),
      email: z.string().trim().toLowerCase().email(),
      phone: z
        .string()
        .trim()
        .transform((v) => v.replace(/[\s-]/g, ""))
        .pipe(z.union([z.literal(""), z.string().regex(/^(\+234|0)\d{10}$/)])),
      role: z.enum(["teacher", "staff"]),
      password,
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return fail(
      field === "password" ? parsed.error.issues[0].message
        : field === "phone" ? "Phone must be a Nigerian number, e.g. 08012345678."
        : field === "email" ? "Enter a valid email address."
        : "Please fill in the name, email, role and password.",
    );
  }
  const v = parsed.data;

  const { data, error } = await createAdminClient().auth.admin.createUser({
    email: v.email,
    password: v.password,
    email_confirm: true,
    app_metadata: { role: v.role, full_name: v.full_name, is_owner: false },
  });
  if (error) return fail(error.code === "email_exists" ? "An account with this email already exists." : "Could not create the account.");

  if (v.phone) {
    const supabase = await createClient();
    await supabase.from("profiles").update({ phone: v.phone }).eq("id", data.user.id);
  }

  revalidatePath("/portal/accounts/staff");
  return done(`Account created for ${v.full_name}. They sign in with ${v.email} and the password you set.`);
}

export async function resetPassword(_prev: Result, formData: FormData): Promise<Result> {
  const me = await requireRole("staff");
  const parsed = z.object({ userId: z.string().uuid(), password }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Enter a password.");

  const supabase = await createClient();
  const { data: target } = await supabase.from("profiles").select("role").eq("id", parsed.data.userId).maybeSingle();
  if (!target) return fail("Account not found.");
  if (target.role !== "student" && !me.is_owner) return fail("Only the owner can change a teacher or staff password.");

  const { error } = await createAdminClient().auth.admin.updateUserById(parsed.data.userId, {
    password: parsed.data.password,
  });
  return error ? fail("Could not change the password.") : done("Password changed.");
}

// Disable / enable. RLS decides who may touch which profile (staff: students, owner: anyone).
export async function setActive(userId: string, active: boolean) {
  const me = await requireRole("staff");
  if (userId === me.id) return; // never lock yourself out
  const supabase = await createClient();
  await supabase.from("profiles").update({ active }).eq("id", userId);
  revalidatePath("/portal/accounts");
  revalidatePath("/portal/accounts/staff");
}
