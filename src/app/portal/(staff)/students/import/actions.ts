"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { importStudentSchema } from "@/lib/student-schema";
import { COLUMNS, REQUIRED_COLUMNS, cleanCell, columnFor, fixBloodGroup, fixDate, fixGender, fixPhone, parseCsv } from "@/lib/students-csv";
import { createClient } from "@/lib/supabase/server";

const MAX_ROWS = 500;

export type Report = { rowCount: number; errors: string[] };

type StudentRow = ReturnType<typeof importStudentSchema.parse>;

// Checks the whole file and returns the rows to insert plus every problem found.
async function validate(text: string) {
  const errors: string[] = [];
  const valid: StudentRow[] = [];

  const [header, ...data] = parseCsv(text);
  if (!header) return { rowCount: 0, errors: ["The file is empty."], valid };

  const cols = header.map(columnFor);
  const missing = REQUIRED_COLUMNS.filter((c) => !cols.includes(c));
  if (missing.length) return { rowCount: 0, errors: [`Missing column(s): ${missing.join(", ")}.`], valid };
  if (data.length > MAX_ROWS) return { rowCount: data.length, errors: [`Too many rows: the limit is ${MAX_ROWS} per file.`], valid };

  const supabase = await createClient();
  const { data: classes } = await supabase.from("classes").select("id, name");
  const byName = new Map<string, string[]>();
  for (const c of classes ?? []) {
    const key = c.name.trim().toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), c.id]);
  }

  const { data: existing } = await supabase
    .from("students")
    .select("admission_no")
    .in("admission_no", data.map((r) => cleanCell(r[cols.indexOf("admission_no")] ?? "").toUpperCase()).filter(Boolean));
  const taken = new Set((existing ?? []).map((s) => s.admission_no));
  const seen = new Set<string>();

  data.forEach((cells, i) => {
    const row = i + 2; // the header is row 1
    const rec: Record<string, string> = {};
    COLUMNS.forEach((c) => {
      const at = cols.indexOf(c);
      rec[c] = at >= 0 ? cleanCell(cells[at] ?? "") : "";
    });

    const className = rec.class.toLowerCase();
    const ids = className ? byName.get(className) : [];
    if (className && !ids?.length) return void errors.push(`Row ${row}: class "${rec.class}" not found.`);
    if (ids && ids.length > 1) return void errors.push(`Row ${row}: more than one class is named "${rec.class}".`);

    const parsed = importStudentSchema.safeParse({
      ...rec,
      gender: fixGender(rec.gender),
      date_of_birth: fixDate(rec.date_of_birth),
      blood_group: fixBloodGroup(rec.blood_group),
      class_id: ids?.[0] ?? null,
      entry_level: rec.entry_level.toLowerCase() || null,
      student_phone: fixPhone(rec.student_phone),
      guardian_phone: fixPhone(rec.guardian_phone),
      // Not CSV columns: everyone imported is active; the rest is edited in the student form.
      status: "active",
      admitted_on: null,
      full_name_ar: "",
      notes: "",
    });
    if (!parsed.success) {
      const field = String(parsed.error.issues[0]?.path[0] ?? "row");
      return void errors.push(`Row ${row}: ${field} is missing or not valid.`);
    }

    const no = parsed.data.admission_no;
    if (taken.has(no)) return void errors.push(`Row ${row}: admission number ${no} already exists.`);
    if (seen.has(no)) return void errors.push(`Row ${row}: admission number ${no} appears twice in the file.`);
    seen.add(no);
    valid.push(parsed.data);
  });

  return { rowCount: data.length, errors, valid };
}

export async function checkCsv(text: string): Promise<Report> {
  await requireRole("staff");
  const { rowCount, errors } = await validate(text);
  return { rowCount, errors };
}

// All or nothing: one insert, and only when the whole file is valid.
export async function importCsv(text: string): Promise<{ imported: number; error: string | null }> {
  await requireRole("staff");
  const { errors, valid } = await validate(text);
  if (errors.length || !valid.length) return { imported: 0, error: "The file has problems. Check it again." };

  const supabase = await createClient();
  const { error } = await supabase.from("students").insert(valid);
  if (error) return { imported: 0, error: "Could not import the students. Nothing was saved." };

  revalidatePath("/portal/students");
  return { imported: valid.length, error: null };
}
