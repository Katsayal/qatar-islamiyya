import { test } from "node:test";
import assert from "node:assert/strict";
import { currentMonth, monthLabel, monthStart } from "./months.ts";

test("monthStart turns a month into its first day and rejects anything else", () => {
  assert.equal(monthStart("2026-10"), "2026-10-01");
  assert.equal(monthStart(" 2027-01 "), "2027-01-01");
  for (const bad of ["", "2026", "2026-00", "2026-13", "2026-1", "26-10", "2026-10-05", "October"]) {
    assert.equal(monthStart(bad), null, bad);
  }
});

test("currentMonth keeps year and month of today's date", () => {
  assert.equal(currentMonth("2026-10-10"), "2026-10");
  assert.equal(currentMonth("2027-01-01"), "2027-01");
});

test("monthLabel is the month name and year; bad input is returned as is", () => {
  assert.equal(monthLabel("2026-10"), "October 2026");
  assert.equal(monthLabel("2027-03"), "March 2027");
  assert.equal(monthLabel("nonsense"), "nonsense");
});
