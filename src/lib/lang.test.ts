import { test } from "node:test";
import assert from "node:assert/strict";
import { browserPath, hasLang, href, langOfPath, otherLangPath, publicRoute, toLang } from "./lang.ts";

test("hasLang accepts en and ar only", () => {
  assert.equal(hasLang("en"), true);
  assert.equal(hasLang("ar"), true);
  for (const bad of ["", "fr", "AR", "ha"]) assert.equal(hasLang(bad), false, bad);
});

test("href keeps English paths and puts Arabic under /ar", () => {
  assert.equal(href("en", "/about"), "/about");
  assert.equal(href("en", "/"), "/");
  assert.equal(href("ar", "/"), "/ar");
  assert.equal(href("ar", "/about"), "/ar/about");
  assert.equal(href("ar", "/programs#tahfiz"), "/ar/programs#tahfiz");
  assert.equal(href("ar", "/#news"), "/ar#news");
});

test("langOfPath and otherLangPath switch between the two versions of a page", () => {
  assert.equal(langOfPath("/ar"), "ar");
  assert.equal(langOfPath("/ar/news/1"), "ar");
  assert.equal(langOfPath("/about"), "en");
  assert.equal(langOfPath("/arabic"), "en");
  assert.equal(otherLangPath("/"), "/ar");
  assert.equal(otherLangPath("/news/1"), "/ar/news/1");
  assert.equal(otherLangPath("/ar"), "/");
  assert.equal(otherLangPath("/ar/about"), "/about");
});

test("toLang and browserPath", () => {
  assert.equal(toLang("ar"), "ar");
  assert.equal(toLang("xx"), "en");
  assert.equal(browserPath("/en"), "/");
  assert.equal(browserPath("/en/about"), "/about");
  assert.equal(browserPath("/about"), "/about");
  assert.equal(browserPath("/ar/about"), "/ar/about");
  assert.equal(browserPath("/english"), "/english");
});

test("publicRoute rewrites public pages, redirects /en and leaves the rest alone", () => {
  assert.deepEqual(publicRoute("/"), { action: "rewrite", to: "/en" });
  assert.deepEqual(publicRoute("/about"), { action: "rewrite", to: "/en/about" });
  assert.deepEqual(publicRoute("/news/abc"), { action: "rewrite", to: "/en/news/abc" });
  assert.deepEqual(publicRoute("/arabic"), { action: "rewrite", to: "/en/arabic" });
  assert.deepEqual(publicRoute("/en"), { action: "redirect", to: "/" });
  assert.deepEqual(publicRoute("/en/about"), { action: "redirect", to: "/about" });
  for (const keep of [
    "/ar", "/ar/about", "/portal", "/portal/students", "/login", "/health", "/api/x", "/_next/static/a.js",
    "/sitemap.xml", "/icon.svg", "/logo.svg", "/admission-form.pdf", "/robots.txt",
  ]) {
    assert.equal(publicRoute(keep), null, keep);
  }
});
