"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Bound with the message id and the new value in the page.
export async function setHandled(id: string, handled: boolean) {
  await requireRole("staff");
  const supabase = await createClient();
  await supabase.from("contact_messages").update({ handled }).eq("id", id);
  revalidatePath("/portal/messages");
}

// Student correction requests: bound with the request id and the new value in the page.
export async function setCorrectionDone(id: string, done: boolean) {
  await requireRole("staff");
  const supabase = await createClient();
  await supabase.from("correction_requests").update({ status: done ? "done" : "open" }).eq("id", id);
  revalidatePath("/portal/messages");
  revalidatePath("/portal/student/profile");
}
