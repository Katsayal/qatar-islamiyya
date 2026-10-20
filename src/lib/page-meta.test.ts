import { test } from "node:test";
import assert from "node:assert/strict";
import { pageMeta } from "./page-meta.ts";

test("pageMeta gives the title and both language versions of a page", () => {
  assert.deepEqual(pageMeta("ar", "/about", "عن المدرسة"), {
    title: "عن المدرسة",
    alternates: { canonical: "/ar/about", languages: { en: "/about", ar: "/ar/about", "x-default": "/about" } },
  });
  assert.deepEqual(pageMeta("en", "/"), {
    alternates: { canonical: "/", languages: { en: "/", ar: "/ar", "x-default": "/" } },
  });
});
