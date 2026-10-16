import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStudentFilters } from "./student-filters.ts";

test("defaults to active students with no other filter", () => {
  assert.deepEqual(parseStudentFilters({}), { q: "", program: undefined, classId: undefined, status: "active" });
});

test("keeps valid filters and drops invalid ones", () => {
  const f = parseStudentFilters({ program: "maahad", class: "abc", status: "all", q: " Khadija " });
  assert.deepEqual(f, { q: "Khadija", program: "maahad", classId: "abc", status: "all" });
  const bad = parseStudentFilters({ program: "nope", status: "deleted" });
  assert.equal(bad.program, undefined);
  assert.equal(bad.status, "active");
});

test("search text cannot carry filter syntax", () => {
  assert.equal(parseStudentFilters({ q: "a,b%c(d)*e" }).q, "a b c d  e");
});
