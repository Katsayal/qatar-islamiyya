"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProofResult = { ok: boolean; message: string } | null;

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PENDING = 3; // per term, so one student cannot flood the staff screen

const fail = (message: string): ProofResult => ({ ok: false, message });

export async function uploadProof(_prev: ProofResult, formData: FormData): Promise<ProofResult> {
  await requireRole("student");
  const term = z.string().uuid().safeParse(formData.get("term_id"));
  if (!term.success) return fail("Please choose a term.");

  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) return fail("Please choose a file.");
  const ext = TYPES[file.type];
  if (!ext || file.size > MAX_BYTES) return fail("The proof must be a JPG, PNG, WebP or PDF file of at most 2 MB.");

  const supabase = await createClient();
  // RLS: a student only sees their own student row, so the id never comes from the form.
  const { data: student } = await supabase.from("students").select("id").maybeSingle();
  if (!student) return fail("Your student record is not linked yet. Please ask the office.");

  const { count } = await supabase
    .from("payment_proofs")
    .select("id", { count: "exact", head: true })
    .eq("term_id", term.data)
    .eq("status", "pending");
  if ((count ?? 0) >= MAX_PENDING) {
    return fail(`You already have ${MAX_PENDING} proofs waiting for this term. Please wait until the office checks them.`);
  }

  const path = `proofs/${student.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("private").upload(path, file, { contentType: file.type });
  if (uploadError) return fail("Could not upload the file. Please try again.");

  const { error } = await supabase.from("payment_proofs").insert({ student_id: student.id, term_id: term.data, file_path: path });
  if (error) {
    await supabase.storage.from("private").remove([path]);
    return fail("Could not save your proof. Please try again.");
  }

  revalidatePath("/portal/student/fees");
  return { ok: true, message: "Proof sent. The office will check it and update your fees." };
}
