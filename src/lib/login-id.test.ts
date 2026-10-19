import { test } from "node:test";
import assert from "node:assert/strict";
import { admissionToEmail, isLoginCode, loginLabel, loginToEmail } from "./login-id.ts";

test("admissionToEmail lower-cases and replaces other characters with -", () => {
  assert.equal(admissionToEmail(" QIS/2026/001 "), "qis-2026-001@students.qatar.local");
  assert.equal(admissionToEmail("QA26MA005"), "qa26ma005@students.qatar.local");
});

test("isLoginCode accepts 3 to 30 letters, digits and -", () => {
  for (const ok of ["QAT001", "qat001", "ZZ-1", "abc", " QAT002 "]) assert.equal(isLoginCode(ok), true, ok);
  for (const bad of ["", "ab", "QAT 001", "QAT/001", "a@b.c", "x".repeat(31)]) assert.equal(isLoginCode(bad), false, bad);
});

test("loginToEmail keeps an email and turns a code into the synthetic address", () => {
  assert.equal(loginToEmail(" Owner@Example.com "), "owner@example.com");
  assert.equal(loginToEmail("QAT001"), "qat001@students.qatar.local");
});

test("loginLabel shows the code for a synthetic address and the email otherwise", () => {
  assert.equal(loginLabel("qat001@students.qatar.local"), "QAT001");
  assert.equal(loginLabel("owner@example.com"), "owner@example.com");
  assert.equal(loginLabel(undefined), "—");
  assert.equal(loginLabel(loginToEmail("qat007")), "QAT007");
});
