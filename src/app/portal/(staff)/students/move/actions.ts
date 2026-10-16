"use server";

import { requireRole } from "@/lib/auth";
import { moveToClasses } from "@/lib/move-students";
import { countMoves, planMoves, type MovePlan, type MoveRow } from "@/lib/student-moves";
import { cleanCell, columnFor, parseCsv } from "@/lib/students-csv";
import { createClient } from "@/lib/supabase/server";

const MAX_ROWS = 500;

export type MoveReport = { rowCount: number; toMove: number; unchanged: number; errors: string[] };

// Reads admission_no and class from the file (other columns are ignored) and plans the moves.
async function plan(text: string): Promise<{ rowCount: number; plan: MovePlan | null; errors: string[] }> {
  const [header, ...data] = parseCsv(text);
  if (!header) return { rowCount: 0, plan: null, errors: ["The file is empty."] };

  const cols = header.map(columnFor);
  const missing = ["admission_no", "class"].filter((c) => !cols.includes(c));
  if (missing.length) return { rowCount: 0, plan: null, errors: [`Missing column(s): ${missing.join(", ")}.`] };
  if (data.length > MAX_ROWS) return { rowCount: data.length, plan: null, errors: [`Too many rows: the limit is ${MAX_ROWS} per file.`] };

  const cell = (cells: string[], c: string) => cleanCell(cells[cols.indexOf(c)] ?? "");
  const rows: MoveRow[] = data.map((cells, i) => ({ row: i + 2, admission_no: cell(cells, "admission_no"), class: cell(cells, "class") }));

  const supabase = await createClient();
  const numbers = rows.map((r) => r.admission_no.toUpperCase()).filter(Boolean);
  const [{ data: students }, { data: classes }] = await Promise.all([
    supabase.from("students").select("id, admission_no, class_id").in("admission_no", numbers),
    supabase.from("classes").select("id, name, active"),
  ]);

  const p = planMoves(rows, students ?? [], classes ?? []);
  return { rowCount: rows.length, plan: p, errors: p.errors };
}

export async function checkMoves(text: string): Promise<MoveReport> {
  await requireRole("staff");
  const r = await plan(text);
  return { rowCount: r.rowCount, toMove: r.plan ? countMoves(r.plan) : 0, unchanged: r.plan?.unchanged ?? 0, errors: r.errors };
}

// All or nothing: re-checks the file, and only a fully valid file changes anything.
export async function applyMoves(text: string): Promise<{ moved: number; error: string | null }> {
  await requireRole("staff");
  const r = await plan(text);
  if (r.errors.length || !r.plan) return { moved: 0, error: "The file has problems. Check it again." };

  const { moved, error } = await moveToClasses(await createClient(), r.plan.moves);
  return { moved, error: error ? `${error} Check the Students list: some may have moved.` : null };
}
