"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Staff only: a teacher who made a mistake asks staff to delete the entry and enters it again.
export async function deleteHifz(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return "Entry not found.";

  const supabase = await createClient();
  const { data, error } = await supabase.from("hifz_entries").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return "Could not delete the entry.";

  revalidatePath("/portal/classes", "layout");
  return null;
}
