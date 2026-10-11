import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { COLUMNS, toCsv } from "@/lib/students-csv";
import { STUDENT_COLUMNS } from "@/lib/student-schema";

// GET /portal/students/export          -> every student, every status (same columns as the import)
// GET /portal/students/export?template=1 -> header row + one example row
export async function GET(request: Request) {
  await requireRole("staff");
  const template = new URL(request.url).searchParams.has("template");
  const rows: string[][] = [[...COLUMNS]];

  if (template) {
    // One example row, in the same order as COLUMNS.
    rows.push([
      "EXAMPLE001", "Aminu Bello Musa", "male", "2015-03-21", "O+", "Zango Road", "Daura",
      "Islamiyya Daura", "", "", "hadda", "", "Bello Musa", "08012345678", "", "Daura",
    ]);
  } else {
    const supabase = await createClient();
    const [{ data: students }, { data: notes }, { data: classes }] = await Promise.all([
      supabase.from("students").select(STUDENT_COLUMNS).order("admission_no").range(0, 9999),
      supabase.rpc("student_notes").range(0, 9999),
      supabase.from("classes").select("id, name"),
    ]);
    const className = new Map((classes ?? []).map((c) => [c.id, c.name]));
    const medical = new Map((notes ?? []).map((n) => [n.id, n.medical_notes]));
    for (const s of students ?? []) {
      const value = {
        ...s,
        class: s.class_id ? (className.get(s.class_id) ?? "") : "",
        medical_notes: medical.get(s.id) ?? "",
      } as Record<string, unknown>;
      rows.push(COLUMNS.map((c) => String(value[c] ?? "")));
    }
  }

  const name = template ? "students-template" : "students";
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
    },
  });
}
