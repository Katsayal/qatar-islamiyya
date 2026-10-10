"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Bound with the proof id and the new status in the page. Verified / rejected record who decided; pending clears it.
export async function setProofStatus(id: string, status: "pending" | "verified" | "rejected") {
  const profile = await requireRole("staff");
  const supabase = await createClient();
  await supabase
    .from("payment_proofs")
    .update({ status, verified_by: status === "pending" ? null : profile.id })
    .eq("id", id);
  revalidatePath("/portal/fees/proofs");
  revalidatePath("/portal/fees");
  revalidatePath("/portal/student/fees");
}
