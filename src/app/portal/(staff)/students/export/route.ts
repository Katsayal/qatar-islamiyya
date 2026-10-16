import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { readAll } from "@/lib/read-all";
import { STUDENT_PROGRAMS, parseStudentFilters } from "@/lib/student-filters";
import { STUDENT_COLUMNS } from "@/lib/student-schema";
import { COLUMNS, exportFileName, exportKeys, headingFor, toCsv } from "@/lib/students-csv";
import { todayInLagos } from "@/lib/today";

const capital = (v: unknown) => {
  const s = String(v ?? "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// GET /portal/students/export?template=1 -> heading row + one example row (the import columns)
// GET /portal/students/export            -> the students the Students list shows (same filters: q, program, class,
//                                           status), every page, sorted by class order, then name.
//                                           &medical=1 adds the Medical Notes column (left out by default).
export async function GET(request: Request) {
  await requireRole("staff");
  const url = new URL(request.url);

  if (url.searchParams.has("template")) {
    const rows = [
      COLUMNS.map(headingFor),
      // One example row, in the same order as COLUMNS.
      ["EXAMPLE001", "Aminu Bello Musa", "male", "2015-03-21", "O+", "Zango Road", "Daura", "Islamiyya Daura", "", "", "hadda", "", "Bello Musa", "08012345678", "", "Daura"],
    ];
    return csv(toCsv(rows), "students-template.csv");
  }

  const f = parseStudentFilters(Object.fromEntries(url.searchParams));
  const includeMedical = url.searchParams.get("medical") === "1";
  const supabase = await createClient();

  const { data: classes } = await supabase.from("classes").select("id, name, program, sort_order");
  const classById = new Map((classes ?? []).map((c) => [c.id, c]));
  const programClassIds = (classes ?? []).filter((c) => c.program === f.program).map((c) => c.id);

  const students = await readAll(async (from, to) => {
    let query = supabase.from("students").select(STUDENT_COLUMNS).order("id").range(from, to);
    if (f.status !== "all") query = query.eq("status", f.status);
    if (f.q) query = query.or(`full_name.ilike.%${f.q}%,admission_no.ilike.%${f.q}%`);
    if (f.classId) query = query.eq("class_id", f.classId);
    else if (f.program) query = query.in("class_id", programClassIds);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  });

  const medical = new Map<string, string>();
  if (includeMedical) {
    const notes = await readAll(async (from, to) => {
      const { data, error } = await supabase.rpc("student_notes").range(from, to);
      if (error) throw error;
      return data ?? [];
    });
    for (const n of notes) medical.set(n.id, n.medical_notes ?? "");
  }

  const classOf = (s: { class_id: string | null }) => (s.class_id ? classById.get(s.class_id) : undefined);
  students.sort(
    (a, b) =>
      (classOf(a)?.sort_order ?? Infinity) - (classOf(b)?.sort_order ?? Infinity) ||
      (classOf(a)?.name ?? "").localeCompare(classOf(b)?.name ?? "", "en") ||
      a.full_name.localeCompare(b.full_name, "en", { sensitivity: "base" }) ||
      a.admission_no.localeCompare(b.admission_no),
  );

  const keys = exportKeys(includeMedical);
  const programLabel = (p?: string) => STUDENT_PROGRAMS.find((x) => x.key === p)?.label ?? "";
  const rows = [keys.map(headingFor)];
  for (const s of students) {
    const c = classOf(s);
    const value: Record<string, string> = {
      ...Object.fromEntries(Object.entries(s).map(([k, v]) => [k, String(v ?? "")])),
      gender: capital(s.gender),
      status: capital(s.status),
      entry_level: capital(s.entry_level),
      class: c?.name ?? "",
      program: programLabel(c?.program),
      medical_notes: medical.get(s.id) ?? "",
    };
    rows.push(keys.map((k) => value[k] ?? ""));
  }

  const scope = f.classId ? classById.get(f.classId)?.name : programLabel(f.program);
  return csv(toCsv(rows), exportFileName([scope, f.status === "active" ? undefined : f.status], todayInLagos()));
}

const csv = (body: string, name: string) =>
  new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` },
  });
