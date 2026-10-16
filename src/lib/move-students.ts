import "server-only";
import { revalidatePath } from "next/cache";
import type { createClient } from "@/lib/supabase/server";

// Changes only class_id: one update per destination class, through the user's session (RLS applies).
// Bio data, status, logins and history are not touched; the activity log records the change.
export async function moveToClasses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  moves: Map<string, string[]>,
): Promise<{ moved: number; error: string | null }> {
  let moved = 0;
  for (const [classId, ids] of moves) {
    const { data, error } = await supabase.from("students").update({ class_id: classId }).in("id", ids).select("id");
    if (error) return { moved, error: "Could not move the students." };
    moved += data?.length ?? 0;
  }
  revalidatePath("/portal/students");
  revalidatePath("/portal");
  revalidatePath("/portal/classes");
  return { moved, error: null };
}
