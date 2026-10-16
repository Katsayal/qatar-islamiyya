import { z } from "zod";
import { BLOOD_GROUPS } from "./blood-groups.ts";

// Every students column a select may ask for. notes and medical_notes are not granted to anyone
// (students must not read them); staff and teachers get them from rpc("student_notes").
// One string literal on purpose: supabase-js reads the column names from its type.
export const STUDENT_COLUMNS = "id, admission_no, full_name, full_name_ar, gender, date_of_birth, photo_path, address, local_government, previous_islamiyya, entry_level, guardian_name, guardian_phone, guardian_address, guardian_local_government, class_id, status, admitted_on, user_id, created_at, updated_at, updated_by, blood_group, student_phone";

// One set of rules for the student form and the CSV import.
// YYYY-MM-DD that is a real calendar date (rejects 2015-31-31).
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  });

const text = (max: number) => z.string().trim().max(max).transform((v) => v || null);
const required = (max: number) => z.string().trim().min(1).max(max);

// Nigerian number, or empty. Used for the guardian's and the student's own phone.
const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.union([z.literal(""), z.string().regex(/^(\+234|0)\d{10}$/)]))
  .transform((v) => v || null);

// The school's bio data: name, admission no., blood group, address, date of birth, gender,
// local government and previous Islamiyya are required (SPEC §3). The rest is optional.
export const studentSchema = z.object({
  admission_no: z.string().trim().min(1).max(30).transform((v) => v.toUpperCase()),
  full_name: z.string().trim().min(2).max(120),
  full_name_ar: text(120),
  gender: z.enum(["male", "female"]),
  date_of_birth: isoDate,
  blood_group: z.enum(BLOOD_GROUPS),
  address: required(200),
  local_government: required(100),
  previous_islamiyya: required(150),
  student_phone: phone,
  admitted_on: isoDate.nullable(),
  class_id: z.string().uuid().nullable(),
  status: z.enum(["active", "graduated", "withdrawn", "archived"]),
  entry_level: z.enum(["hadda", "sauka"]).nullable(),
  medical_notes: text(500),
  notes: text(500),
  guardian_name: text(120),
  guardian_phone: phone,
  guardian_address: text(200),
  guardian_local_government: text(100),
});

// CSV import only: the school's lists are incomplete, so five bio fields may be empty (stored as null).
// A filled value must still be valid. Staff complete the rest in the student form, which uses studentSchema.
export const importStudentSchema = studentSchema.extend({
  date_of_birth: isoDate.or(z.literal("")).transform((v) => v || null),
  blood_group: z.enum(BLOOD_GROUPS).or(z.literal("")).transform((v) => v || null),
  address: text(200),
  local_government: text(100),
  previous_islamiyya: text(150),
});
