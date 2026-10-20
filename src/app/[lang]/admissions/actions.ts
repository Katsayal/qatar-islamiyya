"use server";

import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/blood-groups";
import { createAdminClient } from "@/lib/supabase/admin";

const text = (max: number) =>
  z.string().trim().max(max).transform((v) => v || null);

const schema = z.object({
  program: z.enum(["tahfiz", "maahad", "barnamaj"]),
  full_name: z.string().trim().min(2).max(120),
  gender: z.enum(["male", "female"]),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blood_group: z.enum(BLOOD_GROUPS),
  address: z.string().trim().min(1).max(200),
  local_government: z.string().trim().min(1).max(100),
  previous_islamiyya: z.string().trim().min(1).max(150),
  student_phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.union([z.literal(""), z.string().regex(/^(\+234|0)\d{10}$/)]))
    .transform((v) => v || null),
  entry_level: z.enum(["hadda", "sauka"]).nullable(),
  guardian_name: z.string().trim().min(2).max(120),
  guardian_address: text(200),
  guardian_local_government: text(100),
  guardian_phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+234|0)\d{10}$/)),
  medical_notes: text(500),
  notes: text(500),
  consent: z.literal("on"),
});

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO = 2 * 1024 * 1024;

// The form shows the sentence for the code in the page language (ui.ts, applyForm.errors).
export type ApplyError = "invalid" | "photo" | "upload" | "save";
export type ApplyState = { ok: boolean; error: ApplyError | null };

// Anon has no table or storage rights, so everything goes through the server-only admin client.
export async function submitApplication(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  // Honeypot: bots fill the hidden field. Pretend success.
  if (formData.get("website")) return { ok: true, error: null };

  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse({ ...raw, entry_level: raw.entry_level || null });
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }
  const { consent, ...fields } = parsed.data;

  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (hasPhoto && (!PHOTO_TYPES.includes(photo.type) || photo.size > MAX_PHOTO)) {
    return { ok: false, error: "photo" };
  }

  const supabase = createAdminClient();
  const id = crypto.randomUUID();
  const photo_path = hasPhoto ? `applications/${id}.jpg` : null;

  if (hasPhoto) {
    const { error } = await supabase.storage
      .from("student-photos")
      .upload(photo_path!, photo, { contentType: photo.type });
    if (error) return { ok: false, error: "upload" };
  }

  const { error } = await supabase
    .from("applications")
    .insert({ id, ...fields, photo_path, consent: consent === "on" });
  if (error) {
    if (photo_path) await supabase.storage.from("student-photos").remove([photo_path]);
    return { ok: false, error: "save" };
  }

  return { ok: true, error: null };
}
