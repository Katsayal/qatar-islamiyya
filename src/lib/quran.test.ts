import { test } from "node:test";
import assert from "node:assert/strict";
import { amountForPages, amountForRange, swapIfReversed, type AyahPos } from "./quran.ts";

const pos = (surah: number, ayah: number, page: number, line: number, end_page = page, end_line = line): AyahPos => ({
  surah, ayah, page, line, end_page, end_line,
});

test("single one-line ayah = 1 line", () => {
  const a = pos(2, 10, 3, 4);
  assert.deepEqual(amountForRange(a, a), { start_page: 3, end_page: 3, lines: 1, pages: 0.07 });
});

test("full page (line 1 → line 15) = 15 lines, 1 page", () => {
  const r = amountForRange(pos(2, 6, 3, 1), pos(2, 16, 3, 15));
  assert.equal(r.lines, 15);
  assert.equal(r.pages, 1);
});

test("range across a page boundary", () => {
  // page 3 line 10 → page 4 line 5 = 6 + 5 lines
  const r = amountForRange(pos(2, 12, 3, 10), pos(2, 30, 4, 5));
  assert.deepEqual(r, { start_page: 3, end_page: 4, lines: 11, pages: 0.73 });
});

test("ayah spanning two pages counts to its end", () => {
  // one ayah from page 47 line 14 to page 48 line 13
  const a = pos(2, 282, 47, 14, 48, 13);
  const r = amountForRange(a, a);
  assert.equal(r.end_page, 48);
  assert.equal(r.lines, 15);
});

test("two pages exactly (Ma'ahad minimum)", () => {
  const r = amountForRange(pos(3, 1, 50, 1), pos(3, 20, 51, 15));
  assert.equal(r.pages, 2);
});

test("end before start is rejected", () => {
  assert.throws(() => amountForRange(pos(114, 1, 604, 10), pos(112, 1, 604, 2)));
  assert.throws(() => amountForRange(pos(2, 20, 3, 5), pos(2, 19, 3, 4)));
});

test("reversed ranges are swapped, ordered ones are left alone", () => {
  const nas = { surah: 114, ayah: 1 };
  const duha = { surah: 93, ayah: 1 };
  assert.deepEqual(swapIfReversed(nas, duha), [duha, nas]);
  assert.deepEqual(swapIfReversed(duha, nas), [duha, nas]);
  // same surah, ayahs reversed
  assert.deepEqual(swapIfReversed({ surah: 2, ayah: 20 }, { surah: 2, ayah: 5 }), [
    { surah: 2, ayah: 5 },
    { surah: 2, ayah: 20 },
  ]);
  // same ayah
  assert.deepEqual(swapIfReversed(nas, nas), [nas, nas]);
});

test("page ranges", () => {
  assert.deepEqual(amountForPages(5, 7), { start_page: 5, end_page: 7, lines: 45, pages: 3 });
  assert.deepEqual(amountForPages(604, 604), { start_page: 604, end_page: 604, lines: 15, pages: 1 });
  assert.throws(() => amountForPages(7, 5));
  assert.throws(() => amountForPages(0, 2));
  assert.throws(() => amountForPages(600, 605));
});
