import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { surahs } from "@/lib/surahs";
import { todayInLagos } from "@/lib/today";
import { HifzForm } from "./hifz-form";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const gradeLabel: Record<string, string> = { jayyid: "Jayyid", jayyid_jiddan: "Jayyid Jiddan", mumtaz: "Mumtaz" };

export default async function RecordHifzPage({ params }: { params: Promise<{ id: string; studentId: string }> }) {
  await requireRole("teacher", "staff");
  const { id, studentId } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: c }, { data: classmates }, { data: entries }] = await Promise.all([
    supabase.from("students").select("id, full_name").eq("id", studentId).eq("class_id", id).maybeSingle(),
    supabase.from("classes").select("name, program, hifz_unit").eq("id", id).maybeSingle(),
    supabase.from("students").select("id").eq("class_id", id).eq("status", "active").order("full_name"),
    supabase
      .from("hifz_entries")
      .select("id, entry_date, absent, lesson_type, start_surah, start_ayah, end_surah, end_ayah, pages, grade")
      .eq("student_id", studentId)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  if (!student || !c || (c.program !== "tahfiz" && c.program !== "maahad")) notFound();

  const ids = (classmates ?? []).map((s) => s.id);
  const nextId = ids[ids.indexOf(studentId) + 1];
  const surahName = (n: number | null) => surahs.find((s) => s.number === n)?.name ?? "?";

  return (
    <div className="max-w-xl">
      <Link href={`/portal/classes/${id}/students/${studentId}`} className="text-sm text-primary underline-offset-4 hover:underline">
        ← {student.full_name}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold gold-bar">Record hifz</h1>
      <p className="text-sm text-muted-foreground">
        {student.full_name} · {c.name}
      </p>

      <div className="mt-4">
        <HifzForm studentId={student.id} today={todayInLagos()} defaultMode={c.hifz_unit === "pages" ? "page" : "ayah"} />
      </div>

      {nextId && (
        <Link href={`/portal/classes/${id}/students/${nextId}/hifz`} className="mt-4 flex h-11 items-center justify-center rounded-lg border text-sm font-medium hover:bg-muted bg-card">
          Next student →
        </Link>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-medium">Latest entries</h2>
        <Link href={`/portal/classes/${id}/students/${studentId}/hifz/history`} className="text-sm text-primary underline-offset-4 hover:underline">
          View all →
        </Link>
      </div>
      <ul className="mt-2 divide-y rounded-xl border text-sm bg-card shadow-sm">
        {(entries ?? []).map((e) => (
          <li key={e.id} className="p-3">
            <p className="font-medium">
              {e.entry_date} · {e.absent ? "Absent" : e.lesson_type === "new" ? "New hifz" : "Muraja'ah"}
            </p>
            {!e.absent && (
              <p className="text-muted-foreground">
                {surahName(e.start_surah)} {e.start_ayah} → {surahName(e.end_surah)} {e.end_ayah} · {e.pages} {e.pages === 1 ? "page" : "pages"} ·{" "}
                {gradeLabel[e.grade ?? ""] ?? e.grade}
              </p>
            )}
          </li>
        ))}
        {!entries?.length && <li className="p-3 text-muted-foreground">Nothing recorded yet.</li>}
      </ul>
    </div>
  );
}
