// CSV for the students list: column order, writer, tiny parser, and Excel-friendly cleanup.
// Pure (no imports) so `npm test` can run it.

export const COLUMNS = [
  "admission_no", "full_name", "gender", "date_of_birth", "blood_group", "address", "local_government",
  "previous_islamiyya", "student_phone", "class", "entry_level", "medical_notes",
  "guardian_name", "guardian_phone", "guardian_address", "guardian_local_government",
] as const;

// Columns every row must fill (SPEC §3). The others may be empty.
export const REQUIRED_COLUMNS = [
  "admission_no", "full_name", "gender", "date_of_birth", "blood_group", "address", "local_government", "previous_islamiyya",
] as const;

export type Column = (typeof COLUMNS)[number];
export type CsvRecord = Partial<Record<Column, string>>;

const quote = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// BOM first so Excel reads Arabic as UTF-8.
export function toCsv(rows: string[][]): string {
  return "﻿" + rows.map((r) => r.map(quote).join(",")).join("\r\n") + "\r\n";
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
