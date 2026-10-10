import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Juz, Recent } from "./recent";
import { Summary } from "./summary";

export default async function StudentHifzPage() {
  await requireRole("student");
  const supabase = await createClient();

  // RLS: a student can only read their own row.
  const { data: s } = await supabase.from("students").select("class_id, classes(name, program)").maybeSingle();
  const program = s?.classes?.program;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">My hifz</h1>
        {s?.classes && <p className="text-sm text-muted-foreground">{s.classes.name}</p>}
      </div>

      {!s?.class_id || (program !== "tahfiz" && program !== "maahad") ? (
        <p className="text-sm text-muted-foreground">Hifz progress is for Tahfiz and Ma&apos;ahad students.</p>
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
