"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { feeStatus } from "@/lib/fee-status";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: boolean; message: string | null };
const fail = (message: string): Result => ({ ok: false, message });

const naira = z.coerce.number().int().min(0).max(10_000_000);

export async function saveFee(_prev: Result, formData: FormData): Promise<Result> {
  await requireRole("staff");
  const parsed = z
    .object({
      student_id: z.string().uuid(),
      term_id: z.string().uuid(),
      amount_due: naira,
      amount_paid: naira,
      note: z.string().trim().max(300).transform((v) => v || null),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Enter whole-number amounts in naira (0 or more).");

  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_fees")
    .upsert({ ...v, status: feeStatus(v.amount_due, v.amount_paid) }, { onConflict: "student_id,term_id" });
  if (error) return fail("Could not save the fee.");

  revalidatePath("/portal/fees");
  return { ok: true, message: "Saved." };
}

// Creates an unpaid record for every active student that has none for this term. Never touches existing records.
export async function setTermFee(_prev: Result, formData: FormData): Promise<Result> {
  await requireRole("staff");
  const parsed = z.object({ term_id: z.string().uuid(), amount_due: naira }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Enter the fee as a whole number in naira.");
  const { term_id, amount_due } = parsed.data;

  const supabase = await createClient();
  const [{ data: students }, { data: existing }] = await Promise.all([
    supabase.from("students").select("id").eq("status", "active").range(0, 1999),
    supabase.from("student_fees").select("student_id").eq("term_id", term_id).range(0, 1999),
  ]);
  const have = new Set((existing ?? []).map((f) => f.student_id));
  const missing = (students ?? []).filter((s) => !have.has(s.id));
  if (!missing.length) return { ok: true, message: "Every active student already has a record for this term." };

  const { error } = await supabase
    .from("student_fees")
    .upsert(
      missing.map((s) => ({ student_id: s.id, term_id, amount_due, amount_paid: 0, status: "unpaid" })),
      { onConflict: "student_id,term_id", ignoreDuplicates: true },
    );
  if (error) return fail("Could not create the fee records.");

  revalidatePath("/portal/fees");
  return { ok: true, message: `Created ${missing.length} record${missing.length === 1 ? "" : "s"} of ₦${amount_due.toLocaleString("en-NG")}.` };
}
