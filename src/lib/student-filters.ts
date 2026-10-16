// The Students list filters, cleaned in one place so the list and the CSV export agree. Pure (no imports).

export const STUDENT_PROGRAMS = [
  { key: "tahfiz", label: "Tahfiz" },
  { key: "maahad", label: "Ma'ahad" },
  { key: "barnamaj", label: "Barnamaj" },
];
export const STUDENT_STATUSES = ["active", "graduated", "withdrawn", "archived", "all"];

export type StudentFilterInput = { q?: string; program?: string; class?: string; status?: string };

export function parseStudentFilters(sp: StudentFilterInput) {
  return {
    // Characters that mean something inside a PostgREST filter are replaced by spaces.
    q: (sp.q ?? "").replace(/[%,()*]/g, " ").trim(),
    program: STUDENT_PROGRAMS.some((p) => p.key === sp.program) ? sp.program : undefined,
    classId: sp.class || undefined,
    status: STUDENT_STATUSES.includes(sp.status ?? "") ? sp.status! : "active",
  };
}
