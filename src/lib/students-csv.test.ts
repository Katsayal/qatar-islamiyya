import { test } from "node:test";
import assert from "node:assert/strict";
import { COLUMNS, REQUIRED_COLUMNS, fixBloodGroup, fixDate, fixGender, fixPhone, parseCsv, toCsv } from "./students-csv.ts";

test("the template has the 16 agreed columns and the 8 required ones are among them", () => {
  assert.equal(COLUMNS.length, 16);
  assert.equal(REQUIRED_COLUMNS.length, 8);
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
