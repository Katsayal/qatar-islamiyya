import { test } from "node:test";
import assert from "node:assert/strict";
import { changes, describe, fieldLabel, formatValue, idsToName, type AuditEntry, type Lookups } from "./audit.ts";

const look: Lookups = {
  students: new Map([["s1", "Aliyu Musa (M26TF1023)"]]),
  classes: new Map([["c1", "Abdul-Basit"], ["c2", "Husary"]]),
  people: new Map([["p1", "Aisha Bello"]]),
  books: new Map(),
  terms: new Map([["t1", "Term 1, 2026/2027"]]),
};
const entry = (e: Partial<AuditEntry>): AuditEntry => ({ action: "create", table_name: "classes", old: null, new: null, context: null, summary: null, ...e });

test("describe gives a verb, the area and the record's name", () => {
  assert.deepEqual(describe(entry({ context: { name: "Abdul-Basit" } }), look), { title: "Created class", name: "Abdul-Basit" });
  assert.deepEqual(
    describe(entry({ action: "edit", table_name: "students", context: { full_name: "Aliyu Musa", admission_no: "M26TF1023" } }), look),
    { title: "Edited student", name: "Aliyu Musa (M26TF1023)" },
  );
  assert.deepEqual(
    describe(entry({ action: "delete", table_name: "student_fees", context: { student_id: "s1", term_id: "t1" } }), look),
    { title: "Deleted fee record", name: "Aliyu Musa (M26TF1023) · Term 1, 2026/2027" },
  );
  assert.deepEqual(describe(entry({ action: "account", table_name: "profiles", summary: "Reset the password of X (teacher)" }), look), {
    title: "Reset the password of X (teacher)",
    name: "",
  });
});

test("teacher assignments read as assigned / removed", () => {
  const e = entry({ table_name: "class_teachers", context: { class_id: "c1", teacher_id: "p1" } });
  assert.deepEqual(describe(e, look), { title: "Assigned teacher", name: "Aisha Bello · Abdul-Basit" });
  assert.equal(describe({ ...e, action: "delete" }, look).title, "Removed teacher");
});

test("describe names a deleted student with a plain word", () => {
  assert.equal(describe(entry({ action: "edit", table_name: "hifz_entries", context: { student_id: "gone", entry_date: "2026-10-01" } }), look).name,
    "a deleted student · 2026-10-01");
});

test("changes lists old → new for edits, ids shown as names, hidden fields left out", () => {
  const e = entry({ action: "edit", table_name: "students", old: { class_id: "c1", status: "active" }, new: { class_id: "c2", status: "graduated" } });
  assert.deepEqual(changes(e, look), [
    { field: "Class", from: "Abdul-Basit", to: "Husary" },
    { field: "Status", from: "active", to: "graduated" },
  ]);
});

test("changes lists the whole row for create and delete, without empty fields", () => {
  const e = entry({ action: "delete", old: { id: "c1", name: "Abdul-Basit", level: 1, name_ar: null, active: true, updated_by: "p1" } });
  assert.deepEqual(changes(e, look), [
    { field: "Name", to: "Abdul-Basit" },
    { field: "Level", to: "1" },
    { field: "Active", to: "Yes" },
  ]);
});

test("fieldLabel and formatValue", () => {
  assert.equal(fieldLabel("amount_due"), "Amount due");
  assert.equal(fieldLabel("teacher_id"), "Teacher");
  assert.equal(fieldLabel("sort_order"), "Position in lists");
  assert.equal(formatValue("note", null, look), "—");
  assert.equal(formatValue("active", false, look), "No");
  assert.equal(formatValue("teacher_id", "p1", look), "Aisha Bello");
  assert.equal(formatValue("body", "x".repeat(200), look).length, 118);
});

test("idsToName collects ids by kind from context, old and new", () => {
  const ids = idsToName([
    entry({ action: "edit", table_name: "students", old: { class_id: "c1" }, new: { class_id: "c2" }, context: { id: "s1" } }),
    entry({ table_name: "terms", context: { id: "t9", number: 1 } }),
    entry({ table_name: "salary_months", context: { profile_id: "p1" } }),
  ]);
  assert.deepEqual([...ids.classes], ["c1", "c2"]);
  assert.deepEqual([...ids.terms], ["t9"]);
  assert.deepEqual([...ids.people], ["p1"]);
  assert.equal(ids.students.size, 0);
});
