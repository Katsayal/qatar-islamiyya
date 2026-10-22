"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { isImageBytes } from "@/lib/image-bytes";
import { createClient } from "@/lib/supabase/server";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE = 2 * 1024 * 1024;

const caption = z.string().trim().max(150, "The caption is too long (max 150).").transform((v) => v || null);

function revalidateGallery() {
  revalidatePath("/portal/gallery");
  revalidatePath("/[lang]/gallery", "page"); // public gallery, both languages
}

export type Result = { ok: boolean; message: string } | null;

// One photo per call: the form loops over the chosen photos, so no request comes near the
// hosting time limit (10 photos in one request took ~22 s). No revalidation here: re-rendering
// the page after every photo made each request several seconds longer; the form calls
// refreshGallery() once at the end.
export async function uploadPhoto(formData: FormData): Promise<{ ok: boolean; message: string }> {
  await requireRole("staff");
  const parsedCaption = caption.safeParse(formData.get("caption") ?? "");
  if (!parsedCaption.success) return { ok: false, message: parsedCaption.error.issues[0].message };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Please choose a photo." };
  if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE) {
    return { ok: false, message: "Photos must be JPG, PNG or WebP images of at most 2 MB each." };
  }
  if (!isImageBytes(new Uint8Array(await file.slice(0, 12).arrayBuffer()))) {
    return { ok: false, message: "This file is not a readable JPG, PNG or WebP photo." };
  }

  const supabase = await createClient();
  const id = crypto.randomUUID();
  const path = `gallery/${id}.jpg`;
  const { error: uploadError } = await supabase.storage.from("site").upload(path, file, { contentType: file.type });
  if (uploadError) return { ok: false, message: "Could not store the photo." };
  const { error } = await supabase.from("gallery_items").insert({ id, image_path: path, caption: parsedCaption.data });
  if (error) {
    await supabase.storage.from("site").remove([path]);
    return { ok: false, message: "Could not save the photo." };
  }
  return { ok: true, message: "Photo uploaded." };
}

export async function refreshGallery() {
  await requireRole("staff");
  revalidateGallery();
}

export async function saveCaption(_prev: Result, formData: FormData): Promise<Result> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsedCaption = caption.safeParse(formData.get("caption") ?? "");
  if (!id.success) return { ok: false, message: "Photo not found." };
  if (!parsedCaption.success) return { ok: false, message: parsedCaption.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").update({ caption: parsedCaption.data }).eq("id", id.data);
  if (error) return { ok: false, message: "Could not save the caption." };

  revalidateGallery();
  return { ok: true, message: "Caption saved." };
}

export async function deletePhoto(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return "Photo not found.";

  const supabase = await createClient();
  const { data: item } = await supabase.from("gallery_items").select("image_path").eq("id", id.data).maybeSingle();
  if (!item) return "Photo not found.";

  // Row first: a leftover file is harmless, a gallery entry pointing at a missing file is not.
  const { error } = await supabase.from("gallery_items").delete().eq("id", id.data);
  if (error) return "Could not delete the photo.";
  await supabase.storage.from("site").remove([item.image_path]);

  revalidateGallery();
  redirect("/portal/gallery");
}
