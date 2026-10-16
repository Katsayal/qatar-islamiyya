import { test } from "node:test";
import assert from "node:assert/strict";
import { importStudentSchema, studentSchema } from "./student-schema.ts";

const base = {
  admission_no: "qa26ta001", full_name: "Abubakar Musa", gender: "male", date_of_birth: "", blood_group: "",
  address: "", local_government: "", previous_islamiyya: "", student_phone: "", class_id: null, entry_level: null,
  medical_notes: "", guardian_name: "", guardian_phone: "", guardian_address: "", guardian_local_government: "",
  status: "active", admitted_on: null, full_name_ar: "", notes: "",
};

test("import accepts empty bio fields and stores them as null", () => {
  const r = importStudentSchema.safeParse(base);
  assert.ok(r.success);
  assert.equal(r.data.admission_no, "QA26TA001");
  for (const k of ["date_of_birth", "blood_group", "address", "local_government", "previous_islamiyya"] as const) {
    assert.equal(r.data[k], null, k);
  }
});

test("import still rejects a filled value that is wrong", () => {
  assert.ok(!importStudentSchema.safeParse({ ...base, date_of_birth: "2008-02-31" }).success);
  assert.ok(!importStudentSchema.safeParse({ ...base, blood_group: "C+" }).success);
});

test("the student form schema still requires the bio fields", () => {
  assert.ok(!studentSchema.safeParse(base).success);
});
