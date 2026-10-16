import { test } from "node:test";
import assert from "node:assert/strict";
import { countMoves, planMoves, type ClassLite, type StudentLite } from "./student-moves.ts";

const classes: ClassLite[] = [
  { id: "c-old", name: "Ma'ahad", active: true },
  { id: "c-a", name: "Halqa A", active: true },
  { id: "c-b", name: "Halqa B", active: true },
  { id: "c-off", name: "Old Halqa", active: false },
];
const students: StudentLite[] = [
  { id: "s1", admission_no: "QA26MA001", class_id: "c-old" },
  { id: "s2", admission_no: "QA26MA002", class_id: "c-old" },
  { id: "s3", admission_no: "QA26MA003", class_id: "c-a" },
];
const row = (n: number, admission_no: string, cls: string) => ({ row: n, admission_no, class: cls });

test("groups students by destination class and counts unchanged ones", () => {
  const plan = planMoves([row(2, "qa26ma001", "halqa a"), row(3, "QA26MA002", "Halqa B"), row(4, "QA26MA003", "Halqa A")], students, classes);
  assert.deepEqual(plan.errors, []);
  assert.deepEqual([...plan.moves], [["c-a", ["s1"]], ["c-b", ["s2"]]]);
  assert.equal(plan.unchanged, 1);
  assert.equal(countMoves(plan), 2);
});

test("reports unknown admission numbers, missing cells and unknown classes by row", () => {
  const plan = planMoves([row(2, "NOPE1", "Halqa A"), row(3, "", "Halqa A"), row(4, "QA26MA001", ""), row(5, "QA26MA001", "Halqa Z")], students, classes);
  assert.deepEqual(plan.errors, [
    "Row 2: admission number NOPE1 not found.",
    "Row 3: admission_no is missing.",
    "Row 4: class is empty (delete the row to leave this student where they are).",
    'Row 5: class "Halqa Z" not found.',
  ]);
});

test("an inactive class is refused with its own message", () => {
  const plan = planMoves([row(2, "QA26MA001", "Old Halqa")], students, classes);
  assert.deepEqual(plan.errors, ['Row 2: class "Old Halqa" is not active.']);
});

test("a repeated admission number is an error", () => {
  const plan = planMoves([row(2, "QA26MA001", "Halqa A"), row(3, "qa26ma001", "Halqa B")], students, classes);
  assert.deepEqual(plan.errors, ["Row 3: admission number QA26MA001 appears twice in the file."]);
});

test("two active classes with the same name are ambiguous", () => {
  const twins = [...classes, { id: "c-a2", name: "Halqa A", active: true }];
  const plan = planMoves([row(2, "QA26MA001", "Halqa A")], students, twins);
  assert.deepEqual(plan.errors, ['Row 2: more than one class is named "Halqa A".']);
});
