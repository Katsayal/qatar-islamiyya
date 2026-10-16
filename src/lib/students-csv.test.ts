import { test } from "node:test";
import assert from "node:assert/strict";
import { COLUMNS, REQUIRED_COLUMNS, cleanCell, columnFor, exportFileName, exportKeys, headingFor, fixBloodGroup, fixDate, fixGender, fixPhone, parseCsv, toCsv } from "./students-csv.ts";

test("the template has the 16 agreed columns and the required ones are among them", () => {
  assert.equal(COLUMNS.length, 16);
  assert.equal(REQUIRED_COLUMNS.length, 3);
  for (const c of REQUIRED_COLUMNS) assert.ok((COLUMNS as readonly string[]).includes(c), c);
  for (const gone of ["status", "admitted_on", "full_name_ar", "notes"]) assert.ok(!(COLUMNS as readonly string[]).includes(gone), gone);
});

test("fixBloodGroup normalises case, spaces, unicode minus and unknown", () => {
  assert.equal(fixBloodGroup("o+"), "O+");
  assert.equal(fixBloodGroup(" ab - "), "AB-");
  assert.equal(fixBloodGroup("A−"), "A-");
  assert.equal(fixBloodGroup("unknown"), "Unknown");
  assert.equal(fixBloodGroup("C+"), "C+");
});

test("parses quotes, embedded comma/newline and escaped quotes", () => {
  const rows = parseCsv('a,b,c\r\n"x, y","line1\nline2","say ""hi"""\r\n');
  assert.deepEqual(rows, [["a", "b", "c"], ["x, y", "line1\nline2", 'say "hi"']]);
});

test("strips BOM, skips blank lines, handles missing final newline", () => {
  assert.deepEqual(parseCsv("﻿a,b\n\n1,2"), [["a", "b"], ["1", "2"]]);
});

test("detects semicolon delimiter", () => {
  assert.deepEqual(parseCsv("a;b\n1;2\n"), [["a", "b"], ["1", "2"]]);
});

test("write then parse round trip keeps Arabic and special characters", () => {
  const rows = [["name", "note"], ["محمد بن علي", 'has "quote", comma\nand newline']];
  assert.deepEqual(parseCsv(toCsv(rows)), rows);
  assert.ok(toCsv(rows).startsWith("﻿"));
});

test("toCsv stops formulas but keeps phone numbers", () => {
  const [, line] = toCsv([["a"], ["=HYPERLINK(\"x\")"]]).split("\r\n");
  assert.equal(line, `"'=HYPERLINK(""x"")"`);
  const out = parseCsv(toCsv([["@SUM(A1)", "+cmd|x", "-1+1", "+2348038102495", "-5", "Aminu"]]))[0];
  assert.deepEqual(out, ["'@SUM(A1)", "'+cmd|x", "'-1+1", "+2348038102495", "-5", "Aminu"]);
});

test("fixPhone restores Excel's lost leading zero", () => {
  assert.equal(fixPhone("8038102495"), "08038102495");
  assert.equal(fixPhone("0803 810 2495"), "08038102495");
  assert.equal(fixPhone("+2348038102495"), "+2348038102495");
  assert.equal(fixPhone(""), "");
});

test("fixDate accepts day-first dates", () => {
  assert.equal(fixDate("21/03/2015"), "2015-03-21");
  assert.equal(fixDate("1/2/2015"), "2015-02-01");
  assert.equal(fixDate("2015-03-21"), "2015-03-21");
});

test("fixGender accepts m/f in any case", () => {
  assert.equal(fixGender("M"), "male");
  assert.equal(fixGender(" Female "), "female");
});

test("columnFor accepts the school's headers and the template's", () => {
  assert.equal(columnFor("Name"), "full_name");
  assert.equal(columnFor("Admission Number"), "admission_no");
  assert.equal(columnFor("admission_no"), "admission_no");
  assert.equal(columnFor("Blood Group"), "blood_group");
  assert.equal(columnFor(" Date of Birth "), "date_of_birth");
  assert.equal(columnFor("Local Government"), "local_government");
  assert.equal(columnFor("Previous Islamiyya"), "previous_islamiyya");
  assert.equal(columnFor("Class"), "class");
  assert.equal(columnFor("Something else"), "something else");
});

test("cleanCell empties no-data marks and collapses spaces", () => {
  for (const mark of ["X", " x ", "-", "N/A", ""]) assert.equal(cleanCell(mark), "");
  assert.equal(cleanCell("ALIYU SANI  USMAN "), "ALIYU SANI USMAN");
  assert.equal(cleanCell("MAX"), "MAX");
});

test("every heading maps back to its import column, so an export can be re-used", () => {
  for (const key of [...COLUMNS, "program", "status"]) assert.equal(columnFor(headingFor(key)), key);
  assert.equal(headingFor("full_name"), "Full Name");
});

test("export columns: medical notes only when asked for", () => {
  assert.ok(!exportKeys(false).includes("medical_notes"));
  assert.equal(exportKeys(true).at(-1), "medical_notes");
  assert.equal(exportKeys(true).length, exportKeys(false).length + 1);
  for (const k of exportKeys(true)) assert.ok(k === "program" || k === "status" || (COLUMNS as readonly string[]).includes(k), k);
});

test("export file name carries the filter and the date", () => {
  assert.equal(exportFileName([], "2026-10-16"), "students-2026-10-16.csv");
  assert.equal(exportFileName(["Ma'ahad"], "2026-10-16"), "students-ma-ahad-2026-10-16.csv");
  assert.equal(exportFileName(["Tahfiz-Imam Nafi'u", "graduated"], "2026-10-16"), "students-tahfiz-imam-nafi-u-graduated-2026-10-16.csv");
  assert.equal(exportFileName([undefined, ""], "2026-10-16"), "students-2026-10-16.csv");
});
