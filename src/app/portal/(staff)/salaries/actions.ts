"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { feeStatus } from "@/lib/fee-status";
import { monthStart } from "@/lib/months";
import { createClient } from "@/lib/supabase/server";

// Owner only, everywhere: requireOwner first, and RLS (is_owner()) says the same in the database.

export type Result = { ok: boolean; message: string | null };
const fail = (message: string): Result => ({ ok: false, message });

const naira = z.coerce.number().int().min(0).max(100_000_000);
const month = z.string().transform((v, ctx) => {
  const start = monthStart(v);
  if (!start) ctx.addIssue({ code: "custom", message: "Choose a month." });
  return start ?? "";
});

// The fixed monthly salary of one person. Changing it only affects months that are set after this.
export async function saveRate(_prev: Result, formData: FormData): Promise<Result> {
  await requireOwner();
  const parsed = z.object({ profile_id: z.string().uuid(), monthly_amount: naira }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Enter the salary as a whole number in naira (0 or more).");

  const supabase = await createClient();
  const { data: person } = await supabase.from("profiles").select("role").eq("id", parsed.data.profile_id).maybeSingle();
  if (!person || (person.role !== "teacher" && person.role !== "staff")) return fail("Account not found.");

  const { error } = await supabase.from("salary_rates").upsert(parsed.data, { onConflict: "profile_id" });
  if (error) return fail("Could not save the salary.");

  revalidatePath("/portal/salaries/rates");
  revalidatePath("/portal/salaries");
  return { ok: true, message: "Saved." };
}

// Creates an unpaid record for every ACTIVE teacher/staff member who has a salary and no record for the month.
// Never touches existing records, so it is safe to press twice.
export async function setMonthSalaries(_prev: Result, formData: FormData): Promise<Result> {
  await requireOwner();
  const parsed = z.object({ month }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Choose a month.");
  const monthDate = parsed.data.month;

  const supabase = await createClient();
  const [{ data: people }, { data: rates }, { data: existing }] = await Promise.all([
    supabase.from("profiles").select("id").in("role", ["teacher", "staff"]).eq("active", true),
    supabase.from("salary_rates").select("profile_id, monthly_amount"),
    supabase.from("salary_months").select("profile_id").eq("month", monthDate),
  ]);
  const rate = new Map((rates ?? []).map((r) => [r.profile_id, r.monthly_amount]));
  const have = new Set((existing ?? []).map((m) => m.profile_id));

  const active = people ?? [];
  const noRate = active.filter((p) => !rate.has(p.id) && !have.has(p.id)).length;
  const missing = active.filter((p) => rate.has(p.id) && !have.has(p.id));

  if (missing.length) {
    const { error } = await supabase.from("salary_months").upsert(
      missing.map((p) => ({ profile_id: p.id, month: monthDate, amount_due: rate.get(p.id)!, amount_paid: 0, status: "unpaid" })),
      { onConflict: "profile_id,month", ignoreDuplicates: true },
    );
    if (error) return fail("Could not create the salary records.");
  }

  revalidatePath("/portal/salaries");
  const created = missing.length ? `Created ${missing.length} record${missing.length === 1 ? "" : "s"}.` : "Nothing to create.";
  const skipped = noRate ? ` ${noRate} active ${noRate === 1 ? "person has" : "people have"} no salary set yet.` : "";
  return { ok: true, message: created + skipped };
}

// One person, one month: amount due, total paid so far (part payments), note. Status always follows from the amounts.
export async function saveSalary(_prev: Result, formData: FormData): Promise<Result> {
  await requireOwner();
  const parsed = z
    .object({
      profile_id: z.string().uuid(),
      month,
      amount_due: naira,
      amount_paid: naira,
      note: z.string().trim().max(300).transform((v) => v || null),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Enter whole-number amounts in naira (0 or more).");

  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("salary_months")
    .upsert({ ...v, status: feeStatus(v.amount_due, v.amount_paid) }, { onConflict: "profile_id,month" });
  if (error) return fail("Could not save the salary record.");

  revalidatePath("/portal/salaries");
  return { ok: true, message: "Saved." };
}
