"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_IMAGE = 2 * 1024 * 1024;

export type SettingsResult = { ok: boolean; message: string } | null;

const text = (max: number) => z.string().trim().max(max, "One of the fields is too long.").transform((v) => v || null);
const bankSchema = z.object({
  bank_name: text(80),
  account_name: text(120),
  // Nigerian account numbers are 10 digits (NUBAN). Empty = not announced yet.
  account_number: z
    .string()
    .trim()
    .regex(/^(\d{10})?$/, "The account number must be 10 digits.")
    .transform((v) => v || null),
});

export async function saveBank(_prev: SettingsResult, formData: FormData): Promise<SettingsResult> {
  await requireRole("staff");
  const parsed = bankSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };

  const supabase = await createClient();
  const { error } = await supabase.from("school_settings").update(parsed.data).eq("id", 1);
  if (error) return { ok: false, message: "Could not save the bank details." };

  revalidatePath("/portal/settings");
  revalidatePath("/[lang]", "layout"); // bank details on the public admissions and donate pages, both languages
  return { ok: true, message: "Bank details saved." };
}

export async function uploadSignature(_prev: SettingsResult, formData: FormData): Promise<SettingsResult> {
  await requireRole("staff");
  const file = formData.get("signature");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Please choose an image." };
  const ext = IMAGE_TYPES[file.type];
  if (!ext || file.size > MAX_IMAGE) return { ok: false, message: "The signature must be a JPG, PNG or WebP image of at most 2 MB." };

  const supabase = await createClient();
  const { data: old } = await supabase.from("school_settings").select("signature_path").eq("id", 1).maybeSingle();

  // New file name each time; the old file is removed once the new one is saved.
  const path = `signature/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("private").upload(path, file, { contentType: file.type });
  if (uploadError) return { ok: false, message: "Could not upload the signature. Please try again." };

  const { error } = await supabase.from("school_settings").update({ signature_path: path }).eq("id", 1);
  if (error) {
    await supabase.storage.from("private").remove([path]);
    return { ok: false, message: "Could not save the signature." };
  }
  if (old?.signature_path) await supabase.storage.from("private").remove([old.signature_path]);

  revalidatePath("/portal/settings");
  return { ok: true, message: "Signature saved. It now appears on report cards." };
}

export async function removeSignature(): Promise<SettingsResult> {
  await requireRole("staff");
  const supabase = await createClient();
  const { data: old } = await supabase.from("school_settings").select("signature_path").eq("id", 1).maybeSingle();
  if (!old?.signature_path) return { ok: false, message: "There is no signature to remove." };

  const { error } = await supabase.from("school_settings").update({ signature_path: null }).eq("id", 1);
  if (error) return { ok: false, message: "Could not remove the signature." };
  await supabase.storage.from("private").remove([old.signature_path]);

  revalidatePath("/portal/settings");
  return { ok: true, message: "Signature removed." };
}

// Hijri date offset (SPEC §11a): "from this date, shift the Umm al-Qura date by N days". Same date again = replaced.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date.")
  .refine((v) => new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v, "Please choose a real date.");
const hijriSchema = z.object({
  starts_on: isoDate,
  days: z.coerce.number().int().min(-2, "The shift must be between -2 and +2 days.").max(2, "The shift must be between -2 and +2 days."),
});

function refreshDates() {
  revalidatePath("/portal", "layout"); // portal banners, pickers, report cards, portal news
  revalidatePath("/[lang]", "layout"); // public news dates, both languages
}

export async function saveHijriOffset(_prev: SettingsResult, formData: FormData): Promise<SettingsResult> {
  await requireRole("staff");
  const parsed = hijriSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };

  const supabase = await createClient();
  const { error } = await supabase.from("hijri_offsets").upsert(parsed.data, { onConflict: "starts_on" });
  if (error) return { ok: false, message: "Could not save the Hijri date change." };

  refreshDates();
  return { ok: true, message: "Hijri date change saved." };
}

export async function deleteHijriOffset(_prev: SettingsResult, formData: FormData): Promise<SettingsResult> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { ok: false, message: "Could not delete the change." };

  const supabase = await createClient();
  const { error, count } = await supabase.from("hijri_offsets").delete({ count: "exact" }).eq("id", id.data);
  if (error || !count) return { ok: false, message: "Could not delete the change." };

  refreshDates();
  return { ok: true, message: "Change deleted." };
}
