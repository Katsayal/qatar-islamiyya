import { Suspense } from "react";
import { PortalTitle } from "@/components/portal-title";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Juz, Recent } from "./recent";
import { Summary } from "./summary";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function StudentHifzPage() {
  await requireRole("student");
  const supabase = await createClient();

  // RLS: a student can only read their own row.
  const { data: s } = await supabase.from("students").select("class_id, classes(name, program)").maybeSingle();
  const program = s?.classes?.program;

  return (
    <div className="max-w-xl space-y-6">
      <PortalTitle title="My hifz" subtitle={s?.classes?.name} />

      {!s?.class_id || (program !== "tahfiz" && program !== "maahad") ? (
        <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground shadow-sm">Hifz progress is for Tahfiz and Ma&apos;ahad students.</p>
      ) : (
        <>
          <Suspense fallback={null}>
            <Summary classId={s.class_id} program={program} />
          </Suspense>
          <Suspense fallback={null}>
            <Juz />
          </Suspense>
          <Suspense fallback={null}>
            <Recent />
          </Suspense>
        </>
      )}
    </div>
  );
}
