import { test } from "node:test";
import assert from "node:assert/strict";
import { isSchoolDay } from "./attendance.ts";

test("school days are Sat, Sun, Tue, Wed", () => {
  // 2026-10-03 is a Saturday
  const week = ["2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09"];
  assert.deepEqual(week.map(isSchoolDay), [true, true, false, true, true, false, false]);
});
