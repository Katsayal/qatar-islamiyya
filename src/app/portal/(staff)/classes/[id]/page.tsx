import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireRole("teacher", "staff");
  const { id } = await params;
  const supabase = await createClient();

  // RLS lets teachers read every class row, so a teacher must be assigned to open this page.
  if (profile.role === "teacher") {
    const { data: link } = await supabase
      .from("class_teachers")
      .select("class_id")
      .eq("class_id", id)
      .eq("teacher_id", profile.id)
      .maybeSingle();
    if (!link) notFound();
  }

  const [{ data: c }, { data: students }] = await Promise.all([
    supabase.from("classes").select("id, name, program, level, hifz_unit").eq("id", id).maybeSingle(),
    supabase
      .from("students")
      .select("id, admission_no, full_name, gender")
      .eq("class_id", id)
      .eq("status", "active")
      .order("full_name"),
  ]);
  if (!c) notFound();

  return (
    <div>
      <Link href="/portal/classes" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Classes
      </Link>
      <h1 className="mt-2 text-xl font-semibold">{c.name}</h1>
      <p className="text-sm capitalize text-muted-foreground">
        {c.program}
        {c.level ? ` · Level ${c.level}` : ""}
        {c.hifz_unit ? ` · ${c.hifz_unit}` : ""} · {students?.length ?? 0} active student{students?.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-4 divide-y rounded-lg border">
        {(students ?? []).map((s) => (
          <li key={s.id}>
            <Link
              href={`/portal/classes/${c.id}/students/${s.id}`}
              className="flex items-center justify-between gap-3 p-3 hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{s.full_name}</p>
                <p className="text-sm text-muted-foreground">{s.admission_no}</p>
              </div>
              <span className="shrink-0 text-xs capitalize text-muted-foreground">{s.gender}</span>
            </Link>
          </li>
        ))}
        {!students?.length && <li className="p-4 text-sm text-muted-foreground">No active students in this class.</li>}
      </ul>
    </div>
  );
}
