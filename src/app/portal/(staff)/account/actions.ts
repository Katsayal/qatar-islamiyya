"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { phone } from "@/lib/student-schema";

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

// A teacher, staff member or the owner sets, changes or clears their own phone (P.2). The database function
// set_my_phone changes only the caller's own row; the activity log records the edit.
export async function saveOwnPhone(_prev: PasswordResult, formData: FormData): Promise<PasswordResult> {
  await requireRole("teacher", "staff");
  const parsed = phone.safeParse(formData.get("phone") ?? "");
  if (!parsed.success) return { ok: false, message: "Phone must be a Nigerian number, e.g. 08012345678." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_my_phone", { p_phone: parsed.data ?? "" });
  if (error) return { ok: false, message: "Could not save the phone number. Please try again." };

  revalidatePath("/portal/account");
  revalidatePath("/portal/accounts/staff");
  return { ok: true, message: parsed.data ? "Phone number saved." : "Phone number removed." };
}
