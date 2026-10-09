import { z } from "zod";

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

export const studentSchema = z.object({
  admission_no: z.string().trim().min(1).max(30).transform((v) => v.toUpperCase()),
  full_name: z.string().trim().min(2).max(120),
  full_name_ar: text(120),
  gender: z.enum(["male", "female"]),
  date_of_birth: isoDate.nullable(),
  admitted_on: isoDate.nullable(),
  class_id: z.string().uuid().nullable(),
  status: z.enum(["active", "graduated", "withdrawn", "archived"]),
  address: text(200),
  town: text(100),
  previous_school: text(150),
  entry_level: z.enum(["hadda", "sauka"]).nullable(),
  medical_notes: text(500),
  notes: text(500),
  guardian_name: text(120),
  guardian_phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.union([z.literal(""), z.string().regex(/^(\+234|0)\d{10}$/)]))
    .transform((v) => v || null),
  guardian_address: text(200),
  guardian_town: text(100),
});
