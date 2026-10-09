"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { curriculumRows } from "@/lib/barnamaj-books";
import { createClient } from "@/lib/supabase/server";

const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v))
  .transform((v) => v || null);
const text = (max: number) => z.string().trim().max(max).transform((v) => v || null);

const schema = z
  .object({
    id: z.string().uuid().optional(),
    term_number: z.coerce.number().int().min(1).max(3),
    subject: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(120),
    author: text(300),
    study_type: z.enum(["hifz", "istizhar", "sharh", ""]).transform((v) => v || null),
    teacher_id: z.string().uuid().or(z.literal("")).transform((v) => v || null),
    started_on: optionalDate,
    finished_on: optionalDate,
  })
  .refine((v) => !v.started_on || !v.finished_on || v.finished_on >= v.started_on, {
    message: "The finish date cannot be before the start date.",
    path: ["finished_on"],
  });

export async function saveBook(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const parsed = schema.safeParse({
    ...Object.fromEntries(formData),
    id: formData.get("id") || undefined,
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check the form.";

  const { id, ...row } = parsed.data;
  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("books").update(row).eq("id", id);
    if (error) return "Could not save the book.";
  } else {
    // New books go to the end of the list.
    const { data: last } = await supabase.from("books").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { error } = await supabase.from("books").insert({ ...row, sort_order: (last?.sort_order ?? 0) + 1 });
    if (error) return "Could not save the book.";
  }

  revalidatePath("/portal/books");
  redirect("/portal/books");
}

export async function deleteBook(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return "Book not found.";

  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id.data);
  if (error) {
    return error.code === "23503"
      ? "This book already has exam marks, so it cannot be deleted."
      : "Could not delete the book.";
  }

  revalidatePath("/portal/books");
  redirect("/portal/books");
}

// One-time start: copies the school's curriculum (src/content/barnamaj.ts) into the books table.
export async function loadCurriculum() {
  await requireRole("staff");
  const supabase = await createClient();
  const { count } = await supabase.from("books").select("id", { count: "exact", head: true });
  if (count) return; // never duplicate or overwrite existing books

  const { error } = await supabase.from("books").insert(curriculumRows());
  if (error) throw new Error("Could not load the curriculum.");
  revalidatePath("/portal/books");
}
