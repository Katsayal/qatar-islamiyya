import { z } from "zod";
import { BLOOD_GROUPS } from "./blood-groups.ts";

// Every students column a select may ask for. notes and medical_notes are not granted to anyone
// (students must not read them); staff and teachers get them from rpc("student_notes").
// One string literal on purpose: supabase-js reads the column names from its type.
export const STUDENT_COLUMNS = "id, admission_no, full_name, full_name_ar, gender, date_of_birth, photo_path, address, local_government, previous_islamiyya, entry_level, guardian_name, guardian_phone, guardian_address, guardian_local_government, class_id, status, admitted_on, user_id, created_at, updated_at, updated_by, blood_group, student_phone";

// One set of rules for the staff student form and the CSV import (the public application form is stricter).
// YYYY-MM-DD that is a real calendar date (rejects 2015-31-31).
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  });

const text = (max: number) => z.string().trim().max(max).transform((v) => v || null);

// Nigerian number, or empty. Used for the guardian's and the student's own phone, and for My account (P.2).
export const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(z.union([z.literal(""), z.string().regex(/^(\+234|0)\d{10}$/)]))
  .transform((v) => v || null);

// Only admission no., full name and gender are required (SPEC §3): the school's lists are incomplete, so
// date of birth, blood group, address, local government and previous Islamiyya may be empty (stored as null).
// A filled value must still be valid. The public application form requires all eight.
export const studentSchema = z.object({
  admission_no: z.string().trim().min(1).max(30).transform((v) => v.toUpperCase()),
  full_name: z.string().trim().min(2).max(120),
  full_name_ar: text(120),
  gender: z.enum(["male", "female"]),
  date_of_birth: isoDate.or(z.literal("")).transform((v) => v || null),
  blood_group: z.enum(BLOOD_GROUPS).or(z.literal("")).transform((v) => v || null),
  address: text(200),
  local_government: text(100),
  previous_islamiyya: text(150),
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
