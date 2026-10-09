import { notFound } from "next/navigation";
import type { Profile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// RLS lets every teacher read every class row, so pages for one class must check the assignment.
// Staff may open any class; a teacher only their own (otherwise 404).
export async function requireClassAccess(profile: Profile, classId: string) {
  if (profile.role === "staff") return;
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_teachers")
    .select("class_id")
    .eq("class_id", classId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!data) notFound();
}
