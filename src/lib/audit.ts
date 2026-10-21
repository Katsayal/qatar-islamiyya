// Turns activity-log rows (audit_log, filled by the database) into readable lines.
// Pure, so `npm test` can run it. The page passes in names it looked up for the ids.
import { monthLabel } from "./months.ts";

type Rec = Record<string, unknown>;

export type AuditEntry = {
  action: string; // create | edit | delete | account
  table_name: string;
  old: unknown;
  new: unknown;
  context: unknown;
  summary: string | null;
};

// Names for ids, by kind. Missing ids (deleted records) fall back to a plain word.
export type Lookups = Record<Kind, Map<string, string>>;
export type Kind = "students" | "classes" | "people" | "books" | "terms";

// Which kind of record an `…_id` field points at.
export const ID_KINDS: Record<string, Kind> = {
  student_id: "students",
  class_id: "classes",
  book_id: "books",
  term_id: "terms",
  profile_id: "people",
  teacher_id: "people",
  author_id: "people",
  uploaded_by: "people",
  verified_by: "people",
  recorded_by: "people",
  entered_by: "people",
  user_id: "people",
};

const FALLBACK: Record<Kind, string> = {
  students: "a deleted student",
  classes: "a deleted class",
  people: "a removed account",
  books: "a deleted book",
  terms: "a deleted term",
};

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const named = (look: Lookups, kind: Kind, id: unknown) => (id ? look[kind].get(String(id)) ?? FALLBACK[kind] : "");
const join = (...parts: string[]) => parts.filter(Boolean).join(" · ");

// Area = what the owner filters by. `name` says which record a row is about.
// `verbs` replaces "Created …" / "Deleted …" where another word reads better.
export const AREAS: Record<string, { label: string; name: (c: Rec, look: Lookups) => string; verbs?: Partial<Record<string, string>> }> = {
  academic_years: { label: "Academic year", name: (c) => str(c.name) },
  terms: { label: "Term", name: (c, look) => look.terms.get(str(c.id)) ?? `Term ${str(c.number)}` },
  classes: { label: "Class", name: (c) => str(c.name) },
  class_teachers: {
    label: "Class teacher",
    name: (c, look) => join(named(look, "people", c.teacher_id), named(look, "classes", c.class_id)),
    verbs: { create: "Assigned teacher", delete: "Removed teacher" },
  },
  students: { label: "Student", name: (c) => (c.admission_no ? `${str(c.full_name)} (${str(c.admission_no)})` : str(c.full_name)) },
  books: { label: "Book", name: (c) => str(c.title) },
  student_fees: { label: "Fee record", name: (c, look) => join(named(look, "students", c.student_id), named(look, "terms", c.term_id)) },
  payment_proofs: { label: "Payment proof", name: (c, look) => join(named(look, "students", c.student_id), named(look, "terms", c.term_id)) },
  hifz_entries: { label: "Hifz entry", name: (c, look) => join(named(look, "students", c.student_id), str(c.entry_date)) },
  attendance: { label: "Attendance", name: (c, look) => join(named(look, "students", c.student_id), str(c.att_date)) },
  exam_results: { label: "Exam mark", name: (c, look) => join(named(look, "students", c.student_id), named(look, "books", c.book_id)) },
  report_comments: { label: "Term comment", name: (c, look) => join(named(look, "students", c.student_id), named(look, "terms", c.term_id)) },
  posts: { label: "Post", name: (c) => str(c.title) },
  gallery_items: { label: "Gallery photo", name: (c) => str(c.caption) },
  documents: { label: "Document", name: (c) => str(c.title) },
  applications: { label: "Application", name: (c) => str(c.full_name) },
  contact_messages: { label: "Contact message", name: (c) => str(c.name) },
  correction_requests: { label: "Correction request", name: (c, look) => named(look, "students", c.student_id) },
  profiles: { label: "Account", name: (c) => (c.role ? `${str(c.full_name)} (${str(c.role)})` : str(c.full_name)) },
  school_settings: { label: "Settings", name: () => "" },
  hijri_offsets: { label: "Hijri date", name: () => "" },
  salary_rates: { label: "Salary amount", name: (c, look) => named(look, "people", c.profile_id) },
  salary_months: { label: "Salary record", name: (c, look) => join(named(look, "people", c.profile_id), c.month ? monthLabel(str(c.month).slice(0, 7)) : "") },
};

export const ACTIONS = [
  { key: "create", label: "Created" },
  { key: "edit", label: "Edited" },
  { key: "delete", label: "Deleted" },
  { key: "account", label: "Account" },
];

const asRec = (v: unknown): Rec => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : {});

// "Created class", "Edited student", … plus the record's name (may be empty).
export function describe(e: AuditEntry, look: Lookups): { title: string; name: string } {
  if (e.action === "account") return { title: e.summary ?? "Account action", name: "" };
  const area = AREAS[e.table_name];
  const name = area ? area.name(asRec(e.context), look) : "";
  const special = area?.verbs?.[e.action];
  if (special) return { title: special, name };
  const verb = ACTIONS.find((a) => a.key === e.action)?.label ?? e.action;
  return { title: `${verb} ${area?.label.toLowerCase() ?? e.table_name}`, name };
}

const HIDDEN = new Set(["id", "created_at", "updated_at", "updated_by"]);

// Names the forms use, where the column name would read oddly.
const FIELD_LABELS: Record<string, string> = { sort_order: "Position in lists", name_ar: "Arabic name", full_name_ar: "Arabic name" };

// "class_id" -> "Class", "amount_due" -> "Amount due"
export function fieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const k = key.endsWith("_id") ? key.slice(0, -3) : key;
  const s = k.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatValue(key: string, v: unknown, look: Lookups): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  const kind = ID_KINDS[key];
  if (kind) return named(look, kind, v);
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 120 ? `${s.slice(0, 117)}…` : s;
}

// The lines under "What changed". Edits: old → new per changed field. Create / delete: the whole row.
export function changes(e: AuditEntry, look: Lookups): { field: string; from?: string; to: string }[] {
  const oldR = asRec(e.old);
  const newR = asRec(e.new);
  if (e.action === "edit") {
    return Object.keys(newR)
      .filter((k) => !HIDDEN.has(k))
      .map((k) => ({ field: fieldLabel(k), from: formatValue(k, oldR[k], look), to: formatValue(k, newR[k], look) }));
  }
  const row = e.action === "delete" ? oldR : newR;
  return Object.keys(row)
    .filter((k) => !HIDDEN.has(k) && row[k] !== null && row[k] !== "")
    .map((k) => ({ field: fieldLabel(k), to: formatValue(k, row[k], look) }));
}

// Every id the page must name, grouped by kind (from context, old and new).
export function idsToName(entries: AuditEntry[]): Record<Kind, Set<string>> {
  const out: Record<Kind, Set<string>> = { students: new Set(), classes: new Set(), people: new Set(), books: new Set(), terms: new Set() };
  for (const e of entries) {
    for (const r of [asRec(e.context), asRec(e.old), asRec(e.new)]) {
      for (const [k, v] of Object.entries(r)) {
        const kind = ID_KINDS[k];
        if (kind && typeof v === "string") out[kind].add(v);
      }
    }
    if (e.table_name === "terms") {
      const id = asRec(e.context).id;
      if (typeof id === "string") out.terms.add(id);
    }
  }
  return out;
}
