import { test } from "node:test";
import assert from "node:assert/strict";
import { gregorianDate, HAUSA_MONTHS, hausaWeekday, hijriDate, offsetFor } from "./hijri.ts";

const offsets = [
  { starts_on: "2026-11-20", days: 0 },
  { starts_on: "2026-10-01", days: -1 },
];

test("offsetFor uses the latest change on or before the date", () => {
  assert.equal(offsetFor("2026-09-30", offsets), 0); // before the first change
  assert.equal(offsetFor("2026-10-01", offsets), -1); // the day itself
  assert.equal(offsetFor("2026-11-19", offsets), -1); // between changes
  assert.equal(offsetFor("2026-12-25", offsets), 0); // after the second change (input is unsorted)
  assert.equal(offsetFor("2026-10-21", []), 0);
});

test("hijriDate gives Umm al-Qura with Hausa month names", () => {
  assert.equal(hijriDate("2026-10-21", []), "10 Jimada Ula 1448 AH");
  assert.equal(hijriDate("2026-02-18", []), "1 Ramadan 1447 AH");
});

test("hijriDate applies the offset, across a month boundary", () => {
  assert.equal(hijriDate("2026-02-18", [{ starts_on: "2026-01-01", days: -1 }]), "29 Sha'aban 1447 AH");
  assert.equal(hijriDate("2026-02-17", [{ starts_on: "2026-01-01", days: 1 }]), "1 Ramadan 1447 AH");
  assert.equal(hijriDate("2026-10-21", offsets), "9 Jimada Ula 1448 AH");
});

test("hijriDate in Arabic uses Arabic month names and Western digits", () => {
  assert.equal(hijriDate("2026-10-21", [], "ar"), "10 جمادى الأولى 1448 هـ");
});

test("every Hijri month maps to its Hausa name", () => {
  assert.equal(HAUSA_MONTHS.length, 12);
  // the 1st of each month of 1448 AH lands on a different name, in order
  const seen = new Set<string>();
  const d = new Date("2026-06-16T00:00:00Z"); // 1 Muharram 1448 (Umm al-Qura)
  for (let i = 0; i < 360; i++) {
    seen.add(hijriDate(d.toISOString().slice(0, 10), []).replace(/^\d+ | \d+ AH$/g, ""));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  assert.deepEqual([...seen], HAUSA_MONTHS);
});

test("hausaWeekday and gregorianDate", () => {
  assert.equal(hausaWeekday("2026-10-21"), "Laraba");
  assert.equal(hausaWeekday("2026-10-20"), "Talata");
  assert.equal(gregorianDate("2026-10-21"), "21 October 2026");
  assert.equal(gregorianDate("2026-10-21", "en", "medium"), "21 Oct 2026");
  assert.equal(gregorianDate("2026-10-21", "en", "long", true), "Wednesday 21 October 2026");
  assert.equal(gregorianDate("2026-10-21", "ar"), "21 أكتوبر 2026");
});
