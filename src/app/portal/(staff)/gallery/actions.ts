"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE = 2 * 1024 * 1024;
const MAX_FILES = 10;

const caption = z.string().trim().max(150, "The caption is too long (max 150).").transform((v) => v || null);

function revalidateGallery() {
  revalidatePath("/portal/gallery");
  revalidatePath("/gallery");
}

export type UploadResult = { ok: boolean; message: string } | null;

export async function uploadPhotos(_prev: UploadResult, formData: FormData): Promise<UploadResult> {
  await requireRole("staff");
  const parsedCaption = caption.safeParse(formData.get("caption") ?? "");
  if (!parsedCaption.success) return { ok: false, message: parsedCaption.error.issues[0].message };

  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, message: "Please choose at least one photo." };
  if (files.length > MAX_FILES) return { ok: false, message: `Please upload at most ${MAX_FILES} photos at a time.` };
  if (files.some((f) => !IMAGE_TYPES.includes(f.type) || f.size > MAX_IMAGE)) {
    return { ok: false, message: "Photos must be JPG, PNG or WebP images of at most 2 MB each." };
  }

  const supabase = await createClient();
  let uploaded = 0;
  for (const file of files) {
    const id = crypto.randomUUID();
    const path = `gallery/${id}.jpg`;
    const { error: uploadError } = await supabase.storage.from("site").upload(path, file, { contentType: file.type });
    if (uploadError) break;
    const { error } = await supabase.from("gallery_items").insert({ id, image_path: path, caption: parsedCaption.data });
    if (error) {
      await supabase.storage.from("site").remove([path]);
      break;
    }
    uploaded++;
  }

  revalidateGallery();
  if (uploaded < files.length) {
    return { ok: false, message: `Uploaded ${uploaded} of ${files.length} photos. Please try the rest again.` };
  }
  return { ok: true, message: uploaded === 1 ? "Photo uploaded." : `${uploaded} photos uploaded.` };
}

export async function saveCaption(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsedCaption = caption.safeParse(formData.get("caption") ?? "");
  if (!id.success) return "Photo not found.";
  if (!parsedCaption.success) return parsedCaption.error.issues[0].message;

  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").update({ caption: parsedCaption.data }).eq("id", id.data);
  if (error) return "Could not save the caption.";

  revalidateGallery();
  redirect("/portal/gallery");
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
