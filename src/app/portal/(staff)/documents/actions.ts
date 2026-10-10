"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { bucketFor } from "@/lib/documents";
import { createClient } from "@/lib/supabase/server";

const EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "webp"];
const MAX_FILE = 5 * 1024 * 1024;

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Please enter a title.").max(120, "The title is too long (max 120)."),
  category: z.string().trim().max(60, "The category is too long (max 60).").transform((v) => v || null),
  visibility: z.enum(["general", "students", "vault"]).optional(),
});

export async function saveDocument(_prev: string | null, formData: FormData): Promise<string | null> {
  const profile = await requireRole("staff");
  const parsed = schema.safeParse({ ...Object.fromEntries(formData), id: formData.get("id") || undefined });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check the form.";
  const { id, title, category, visibility } = parsed.data;

  const supabase = await createClient();

  if (id) {
    // Editing: title and category only (moving a file between buckets is delete + re-upload).
    const { error } = await supabase.from("documents").update({ title, category }).eq("id", id);
    if (error) return "Could not save the document.";
  } else {
    if (!visibility) return "Please choose where the document goes.";
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return "Please choose a file.";
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!EXTENSIONS.includes(ext)) return `Allowed files: ${EXTENSIONS.join(", ")}.`;
    if (file.size > MAX_FILE) return "The file is too big (max 5 MB). Please compress it first.";

    const docId = crypto.randomUUID();
    const path = `${docId}.${ext}`;
    const bucket = bucketFor(visibility);
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || undefined });
    if (uploadError) return "Could not upload the file. Please try again.";

    const { error } = await supabase
      .from("documents")
      .insert({ id: docId, title, category, visibility, file_path: path, uploaded_by: profile.id });
    if (error) {
      await supabase.storage.from(bucket).remove([path]);
      return "Could not save the document.";
    }
  }

  revalidatePath("/portal/documents");
  redirect("/portal/documents");
}

export async function deleteDocument(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return "Document not found.";

  const supabase = await createClient();
  const { data: doc } = await supabase.from("documents").select("file_path, visibility").eq("id", id.data).maybeSingle();
  if (!doc) return "Document not found.";

  // Row first: if this fails nothing is lost; a leftover file is harmless, a link to a missing file is not.
  const { error } = await supabase.from("documents").delete().eq("id", id.data);
  if (error) return "Could not delete the document.";
  await supabase.storage.from(bucketFor(doc.visibility)).remove([doc.file_path]);

  revalidatePath("/portal/documents");
  redirect("/portal/documents");
}
