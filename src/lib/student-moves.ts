// Rules for moving students between classes by CSV. Pure (no imports) so `npm test` can run it.

export type MoveRow = { row: number; admission_no: string; class: string };
export type StudentLite = { id: string; admission_no: string; class_id: string | null };
export type ClassLite = { id: string; name: string; active: boolean };

export type MovePlan = {
  errors: string[];
  moves: Map<string, string[]>; // destination class id -> student ids that must change
  unchanged: number; // already in that class
};

const key = (s: string) => s.trim().toLowerCase();

// Matches every row to a student and an ACTIVE class. Collects every problem (row numbers are the file's).
export function planMoves(rows: MoveRow[], students: StudentLite[], classes: ClassLite[]): MovePlan {
  const byNo = new Map(students.map((s) => [s.admission_no.toUpperCase(), s]));
  const plan: MovePlan = { errors: [], moves: new Map(), unchanged: 0 };
  const seen = new Set<string>();

  for (const r of rows) {
    const no = r.admission_no.trim().toUpperCase();
    if (!no) { plan.errors.push(`Row ${r.row}: admission_no is missing.`); continue; }
    if (!r.class.trim()) { plan.errors.push(`Row ${r.row}: class is empty (delete the row to leave this student where they are).`); continue; }

    const student = byNo.get(no);
    if (!student) { plan.errors.push(`Row ${r.row}: admission number ${no} not found.`); continue; }
    if (seen.has(no)) { plan.errors.push(`Row ${r.row}: admission number ${no} appears twice in the file.`); continue; }
    seen.add(no);

    const named = classes.filter((c) => key(c.name) === key(r.class));
    const active = named.filter((c) => c.active);
    if (!named.length) { plan.errors.push(`Row ${r.row}: class "${r.class}" not found.`); continue; }
    if (!active.length) { plan.errors.push(`Row ${r.row}: class "${r.class}" is not active.`); continue; }
    if (active.length > 1) { plan.errors.push(`Row ${r.row}: more than one class is named "${r.class}".`); continue; }

    const target = active[0].id;
    if (student.class_id === target) plan.unchanged++;
    else plan.moves.set(target, [...(plan.moves.get(target) ?? []), student.id]);
  }
  return plan;
}

export function countMoves(plan: MovePlan): number {
  let n = 0;
  for (const ids of plan.moves.values()) n += ids.length;
  return n;
}
