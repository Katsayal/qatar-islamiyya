"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type PasswordResult = { ok: boolean; message: string } | null;

const schema = z
  .object({
    password: z.string().min(6, "The password needs at least 6 characters.").max(72, "The password is too long."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords do not match.", path: ["confirm"] });

// A teacher, staff member or the owner sets their own password (plain, min 6). Uses their own session, not the admin key.
// The flag in user_metadata switches off the reminder on the portal home; a reset clears it again.
export async function changeOwnPassword(_prev: PasswordResult, formData: FormData): Promise<PasswordResult> {
  await requireRole("teacher", "staff");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password, data: { password_changed: true } });
  if (error) return { ok: false, message: "Could not change the password. Please try again." };
  await supabase.auth.refreshSession(); // so the flag is in the next token

  revalidatePath("/portal");
  return { ok: true, message: "Password changed. Use it the next time you sign in." };
}
