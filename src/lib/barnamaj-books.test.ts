import { test } from "node:test";
import assert from "node:assert/strict";
import { bookStatus, curriculumRows } from "./barnamaj-books.ts";

const rows = curriculumRows();

test("all curriculum books become rows, in order, in terms 1-3", () => {
  assert.equal(rows.length, 43);
  assert.deepEqual([...new Set(rows.map((r) => r.term_number))], [1, 2, 3]);
  assert.deepEqual(rows.map((r) => r.sort_order), rows.map((_, i) => i + 1));
});

test("reading types map to the DB values; unknown or blank become null", () => {
  const allowed = new Set(["hifz", "istizhar", "sharh", null]);
  assert.ok(rows.every((r) => allowed.has(r.study_type)));
  assert.equal(rows.find((r) => r.title === "الأخضري")?.study_type, "istizhar");
  assert.equal(rows.find((r) => r.title === "أربعين حديث")?.study_type, "hifz");
  assert.equal(rows.find((r) => r.title === "العشماوي")?.study_type, "sharh");
});

test("bookStatus compares the planned dates with today", () => {
  const today = "2026-10-12";
  assert.equal(bookStatus({ started_on: null, finished_on: null }, today), "Not started");
  assert.equal(bookStatus({ started_on: "2026-11-01", finished_on: "2026-12-01" }, today), "Not started");
  assert.equal(bookStatus({ started_on: "2026-10-01", finished_on: "2026-12-01" }, today), "In progress");
  assert.equal(bookStatus({ started_on: "2026-10-12", finished_on: null }, today), "In progress");
  assert.equal(bookStatus({ started_on: "2026-09-01", finished_on: "2026-10-12" }, today), "Finished");
  assert.equal(bookStatus({ started_on: null, finished_on: "2026-10-01" }, today), "Finished");
});
