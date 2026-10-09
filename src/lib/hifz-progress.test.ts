import { test } from "node:test";
import assert from "node:assert/strict";
import { isBelowMinimum, linesToPages, maahadPace, totalNewPages } from "./hifz-progress.ts";

const e = (lesson_type: string | null, lines: number | null, absent = false) => ({
  absent,
  lesson_type,
  lines,
  pages: lines === null ? null : Math.round((lines / 15) * 100) / 100,
});

test("total counts only new, present entries", () => {
  const entries = [e("new", 30), e("new", 15), e("murajaah", 60), e(null, null, true)];
  assert.equal(totalNewPages(entries), 3);
  assert.equal(totalNewPages([]), 0);
  assert.equal(totalNewPages([e("new", 10)]), 0.67);
});

test("lines convert to pages (15 lines = 1 page, 2 decimals)", () => {
  assert.equal(linesToPages(0), 0);
  assert.equal(linesToPages(15), 1);
  assert.equal(linesToPages(320), 21.33);
  assert.equal(linesToPages(9060), 604);
});

test("below-minimum flag: new lessons under 2 pages only", () => {
  assert.equal(isBelowMinimum(e("new", 29)), true); // 1.93 pages
  assert.equal(isBelowMinimum(e("new", 30)), false); // exactly 2
  assert.equal(isBelowMinimum(e("murajaah", 5)), false);
  assert.equal(isBelowMinimum(e(null, null, true)), false);
});

// A 365-day year: 2026-08-01 → 2027-07-31.
const year = { yearStart: "2026-08-01", yearEnd: "2027-07-31" };

test("pace on day 1 of the year", () => {
  const p = maahadPace({ memorised: 2, ...year, today: "2026-08-01" });
  assert.equal(p.expected, 1.65); // 604 / 365
  assert.equal(p.onTrack, true);
  assert.equal(p.projectedFinish, "2027-05-29"); // 302 days (Aug 1 counted) at 2 pages/day
});

test("pace halfway: on track, ahead, behind", () => {
  const today = "2027-01-30"; // day 183 of 365
  const half = maahadPace({ memorised: 302, ...year, today });
  assert.equal(half.expected, 302.83);
  assert.equal(half.onTrack, true);

  assert.equal(maahadPace({ memorised: 400, ...year, today }).diff > 0, true);

  const behind = maahadPace({ memorised: 100, ...year, today });
  assert.equal(behind.onTrack, false);
  assert.equal(behind.diff, -202.83);
  assert.equal(behind.afterYearEnd, true);
});

test("tolerance: 90% of expected counts as on track", () => {
  const today = "2027-01-30";
  assert.equal(maahadPace({ memorised: 273, ...year, today }).onTrack, true); // 273 ≥ 0.9 × 302.83
  assert.equal(maahadPace({ memorised: 272, ...year, today }).onTrack, false);
});

test("no progress, finished, and dates outside the year", () => {
  assert.equal(maahadPace({ memorised: 0, ...year, today: "2026-10-09" }).projectedFinish, null);
  assert.equal(maahadPace({ memorised: 604, ...year, today: "2026-10-09" }).projectedFinish, null);
  // before the year starts → treated as day 1; after it ends → treated as the last day
  assert.equal(maahadPace({ memorised: 1, ...year, today: "2026-07-01" }).expected, 1.65);
  assert.equal(maahadPace({ memorised: 1, ...year, today: "2027-09-01" }).expected, 604);
});
