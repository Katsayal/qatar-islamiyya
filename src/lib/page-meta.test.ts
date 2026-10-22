import { test } from "node:test";
import assert from "node:assert/strict";
import { OG_IMAGE, pageMeta } from "./page-meta.ts";

test("pageMeta gives the title and both language versions of a page", () => {
  assert.deepEqual(pageMeta("ar", "/about", "عن المدرسة"), {
    title: "عن المدرسة",
    openGraph: { type: "website", siteName: "Madrasatu Hajiya Hindatu", url: "/ar/about", images: [OG_IMAGE], title: "عن المدرسة" },
    twitter: { card: "summary_large_image", images: ["/og-image.png"] },
    alternates: { canonical: "/ar/about", languages: { en: "/about", ar: "/ar/about", "x-default": "/about" } },
  });
  assert.deepEqual(pageMeta("en", "/"), {
    openGraph: { type: "website", siteName: "Madrasatu Hajiya Hindatu", url: "/", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", images: ["/og-image.png"] },
    alternates: { canonical: "/", languages: { en: "/", ar: "/ar", "x-default": "/" } },
  });
});
