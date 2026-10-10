"use server";

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
export async function changeOwnPassword(_prev: PasswordResult, formData: FormData): Promise<PasswordResult> {
  await requireRole("teacher", "staff");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "Could not change the password. Please try again." };
  await supabase.auth.refreshSession();

  return { ok: true, message: "Password changed. Use it the next time you sign in." };
}
