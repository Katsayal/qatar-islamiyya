// CSV for the students list: column order, writer, tiny parser, and Excel-friendly cleanup.
// Pure (no imports) so `npm test` can run it.

export const COLUMNS = [
  "admission_no", "full_name", "gender", "date_of_birth", "blood_group", "address", "local_government",
  "previous_islamiyya", "student_phone", "class", "entry_level", "medical_notes",
  "guardian_name", "guardian_phone", "guardian_address", "guardian_local_government",
] as const;

// Columns every imported row must fill (SPEC §3). The others may be empty: the school's lists are incomplete.
export const REQUIRED_COLUMNS = ["admission_no", "full_name", "gender"] as const;

export type Column = (typeof COLUMNS)[number];
export type CsvRecord = Partial<Record<Column, string>>;

const quote = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// A cell starting with = + - @ runs as a formula in Excel (text can come from the public application form).
// A leading ' keeps it as text. Plain numbers such as +2348012345678 or -5 are left alone.
const defuse = (v: string) => (/^[=@\t\r]/.test(v) || /^[+-](?![\d\s.]*$)/.test(v) ? `'${v}` : v);

// BOM first so Excel reads Arabic as UTF-8.
export function toCsv(rows: string[][]): string {
  return "﻿" + rows.map((r) => r.map((v) => quote(defuse(v))).join(",")).join("\r\n") + "\r\n";
}

// Handles quotes, commas/newlines inside quotes, a BOM, and `;` as delimiter (some Excel locales).
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

// Extra header spellings, as written in the school's sheets. Compared without case, spaces, "_" or "-".
const HEADER_ALIASES: Record<string, Column> = {
  name: "full_name", studentname: "full_name",
  admissionnumber: "admission_no", admno: "admission_no",
  dob: "date_of_birth", lga: "local_government", sex: "gender",
};

// "Admission Number", "admission_no" and "ADMISSION NO" -> "admission_no". Unknown headers are returned as is.
export function columnFor(header: string): string {
  const key = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  return COLUMNS.find((c) => c.replace(/_/g, "") === key) ?? HEADER_ALIASES[key] ?? header.trim().toLowerCase();
}

// Trims, collapses repeated spaces, and turns the sheet's "no data" marks (X, -, N/A) into an empty cell.
export function cleanCell(v: string): string {
  const s = v.replace(/\s+/g, " ").trim();
  return /^(x|-|n\/a)$/i.test(s) ? "" : s;
}

// Excel drops the leading 0 of phone numbers: 8038102495 -> 08038102495.
export function fixPhone(v: string): string {
  const s = v.replace(/[\s-]/g, "");
  return /^[789]\d{9}$/.test(s) ? "0" + s : s;
}

// Accepts 2015-03-21 or day-first 21/03/2015 (how Nigerian Excel saves dates). Anything else is returned as is.
export function fixDate(v: string): string {
  const s = v.trim();
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : s;
}

export function fixGender(v: string): string {
  const s = v.trim().toLowerCase();
  return s === "m" ? "male" : s === "f" ? "female" : s;
}

// "o+", "AB -", "ab−" (unicode minus) and "unknown" -> the stored value. Anything else is returned as is (the schema rejects it).
export function fixBloodGroup(v: string): string {
  const s = v.trim().toUpperCase().replace(/[\s]/g, "").replace(/[−–‒]/g, "-");
  return s === "UNKNOWN" ? "Unknown" : s;
}

// Friendly headings for the export and the template. Every one maps back to its import column through
// columnFor (case, spaces, "_" and "-" are ignored), so an exported file can be edited and used in Move by CSV.
const HEADINGS: Record<string, string> = {
  admission_no: "Admission No.", full_name: "Full Name", gender: "Gender", class: "Class", program: "Program", status: "Status",
  date_of_birth: "Date of Birth", blood_group: "Blood Group", address: "Address", local_government: "Local Government",
  previous_islamiyya: "Previous Islamiyya", student_phone: "Student Phone", entry_level: "Entry Level",
  guardian_name: "Guardian Name", guardian_phone: "Guardian Phone", guardian_address: "Guardian Address",
  guardian_local_government: "Guardian Local Government", medical_notes: "Medical Notes",
};

export const headingFor = (key: string): string => HEADINGS[key] ?? key;

// Export column order (a register / contact list). Medical notes only when asked for: it is sensitive.
const EXPORT_KEYS = [
  "admission_no", "full_name", "gender", "class", "program", "status", "date_of_birth", "blood_group", "address",
  "local_government", "previous_islamiyya", "student_phone", "entry_level", "guardian_name", "guardian_phone",
  "guardian_address", "guardian_local_government",
] as const;

export const exportKeys = (includeMedical: boolean): string[] => (includeMedical ? [...EXPORT_KEYS, "medical_notes"] : [...EXPORT_KEYS]);

// students-ma-ahad-2026-10-16.csv: the filter parts (class or program, status) then the date.
export function exportFileName(parts: (string | undefined)[], date: string): string {
  const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return ["students", ...parts.filter((p): p is string => !!p).map(slug).filter(Boolean), date].join("-") + ".csv";
}
