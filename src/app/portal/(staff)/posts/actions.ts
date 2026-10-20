"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_COVER = 2 * 1024 * 1024;

const schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Please enter a title.").max(150, "The title is too long (max 150)."),
  body: z.string().trim().max(20000, "The text is too long (max 20,000 characters)."),
  lang: z.enum(["en", "ha", "ar"]),
  audience: z.enum(["public", "internal", "students"]),
});

function revalidatePosts() {
  revalidatePath("/portal/posts");
  revalidatePath("/portal/news");
  revalidatePath("/[lang]", "layout"); // public home, news list and articles, both languages
  revalidatePath("/sitemap.xml");
}

export async function savePost(_prev: string | null, formData: FormData): Promise<string | null> {
  const profile = await requireRole("staff");
  const parsed = schema.safeParse({ ...Object.fromEntries(formData), id: formData.get("id") || undefined });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check the form.";
  const { id, ...fields } = parsed.data;

  const coverField = formData.get("cover");
  const cover = coverField instanceof File && coverField.size > 0 ? coverField : null;
  if (cover && (!COVER_TYPES.includes(cover.type) || cover.size > MAX_COVER)) {
    return "The cover must be a JPG, PNG or WebP image of at most 2 MB.";
  }

  const supabase = await createClient();
  const postId = id ?? crypto.randomUUID();

  let old: { cover_path: string | null; published_at: string | null } | null = null;
  if (id) {
    const { data } = await supabase.from("posts").select("cover_path, published_at").eq("id", id).maybeSingle();
    if (!data) return "Post not found.";
    old = data;
  }

  // Unique file name per upload so the public CDN never serves a replaced image.
  let coverPath = old?.cover_path ?? null;
  const newCoverPath = cover ? `posts/${postId}-${Date.now()}.jpg` : null;
  if (cover && newCoverPath) {
    const { error } = await supabase.storage.from("site").upload(newCoverPath, cover, { contentType: cover.type });
    if (error) return "Could not upload the cover. Please try again.";
    coverPath = newCoverPath;
  } else if (formData.get("remove_cover") === "on") {
    coverPath = null;
  }

  // Published keeps the first publish date on later edits; unticked = draft.
  const publish = formData.get("publish") === "on";
  const published_at = publish ? (old?.published_at ?? new Date().toISOString()) : null;

  const row = { ...fields, cover_path: coverPath, published_at };
  const { error } = id
    ? await supabase.from("posts").update(row).eq("id", id)
    : await supabase.from("posts").insert({ id: postId, ...row, author_id: profile.id });

  if (error) {
    if (newCoverPath) await supabase.storage.from("site").remove([newCoverPath]);
    return "Could not save the post.";
  }

  if (old?.cover_path && old.cover_path !== coverPath) {
    await supabase.storage.from("site").remove([old.cover_path]);
  }

  revalidatePosts();
  redirect("/portal/posts");
}

export async function deletePost(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return "Post not found.";

  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("cover_path").eq("id", id.data).maybeSingle();
  const { error } = await supabase.from("posts").delete().eq("id", id.data);
  if (error) return "Could not delete the post.";
  if (post?.cover_path) await supabase.storage.from("site").remove([post.cover_path]);

  revalidatePosts();
  redirect("/portal/posts");
}
