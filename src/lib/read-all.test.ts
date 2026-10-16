import { test } from "node:test";
import assert from "node:assert/strict";
import { readAll } from "./read-all.ts";

const source = (n: number) => {
  const calls: [number, number][] = [];
  const page = async (from: number, to: number) => {
    calls.push([from, to]);
    return Array.from({ length: Math.max(0, Math.min(to + 1, n) - from) }, (_, i) => from + i);
  };
  return { page, calls };
};

test("reads every row of a source bigger than one chunk", async () => {
  const { page, calls } = source(2500);
  const rows = await readAll(page);
  assert.equal(rows.length, 2500);
  assert.equal(new Set(rows).size, 2500);
  assert.deepEqual(calls, [[0, 999], [1000, 1999], [2000, 2999]]);
});

test("an exact multiple of the chunk size needs one more empty read", async () => {
  const { page, calls } = source(2000);
  assert.equal((await readAll(page)).length, 2000);
  assert.equal(calls.length, 3);
});

test("a small or empty source is one read", async () => {
  assert.equal((await readAll(source(288).page)).length, 288);
  assert.equal((await readAll(source(0).page)).length, 0);
});
