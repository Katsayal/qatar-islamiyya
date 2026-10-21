import { test } from "node:test";
import assert from "node:assert/strict";
import { lagosDate } from "./today.ts";

test("lagosDate gives the Nigerian day of a timestamp", () => {
  assert.equal(lagosDate("2026-10-19T10:00:00Z"), "2026-10-19");
  assert.equal(lagosDate("2026-10-19T23:30:00Z"), "2026-10-20"); // already the next day in Lagos (UTC+1)
  assert.equal(lagosDate("2026-10-19T22:59:00+00:00"), "2026-10-19");
});
