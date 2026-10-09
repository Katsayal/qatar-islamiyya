import { test } from "node:test";
import assert from "node:assert/strict";
import { fixDate, fixGender, fixPhone, parseCsv, toCsv } from "./students-csv.ts";

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
