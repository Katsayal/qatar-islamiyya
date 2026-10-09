"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { feeStatus } from "@/lib/fee-status";
import { createClient } from "@/lib/supabase/server";

const acceptSchema = z.object({
  id: z.string().uuid(),
  admission_no: z.string().trim().min(1).max(30).transform((v) => v.toUpperCase()),
  class_id: z.string().uuid().nullable(),
  admitted_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  form_fee_received: z.literal("on"), // staff confirm the one-off form fee was paid
  fee_due: z.coerce.number().int().min(0).max(10_000_000),
  fee_paid: z.coerce.number().int().min(0).max(10_000_000),
});

// Creates the student from the application, then marks the application accepted.
export async function acceptApplication(_prev: string | null, formData: FormData): Promise<string | null> {
  await requireRole("staff");

  const parsed = acceptSchema.safeParse({
    id: formData.get("id"),
    admission_no: formData.get("admission_no"),
    class_id: formData.get("class_id") || null,
    admitted_on: formData.get("admitted_on"),
    form_fee_received: formData.get("form_fee_received"),
    fee_due: formData.get("fee_due") || 0,
    fee_paid: formData.get("fee_paid") || 0,
  });
  if (!parsed.success) {
    return parsed.error.issues.some((i) => i.path[0] === "form_fee_received")
      ? "Tick the box to confirm the ₦2,000 form fee was received."
      : "Check the admission number, date and fee amounts.";
  }
  const { id, admission_no, class_id, admitted_on, fee_due, fee_paid } = parsed.data;

  const supabase = await createClient();
  const { data: a } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
  if (!a) return "Application not found.";
  if (a.status !== "new") return "This application was already handled.";

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      admission_no,
      class_id,
      admitted_on,
      full_name: a.full_name,
      gender: a.gender,
      date_of_birth: a.date_of_birth,
      address: a.address,
      town: a.town,
      previous_school: a.previous_school,
      entry_level: a.entry_level,
      medical_notes: a.medical_notes,
      notes: a.notes,
      guardian_name: a.guardian_name,
      guardian_phone: a.guardian_phone,
      guardian_address: a.guardian_address,
      guardian_town: a.guardian_town,
      photo_path: a.photo_path, // same file, not copied
    })
    .select("id")
    .single();
  if (error) return error.code === "23505" ? "This admission number is already used." : "Could not create the student.";

  // The term fee record for the current term (if there is one), so Fees tracks this student from day one.
  const today = new Date().toISOString().slice(0, 10);
  const { data: term } = await supabase
    .from("terms")
    .select("id")
    .lte("starts_on", today)
    .gte("ends_on", today)
    .maybeSingle();
  if (term) {
    const { error: feeError } = await supabase.from("student_fees").insert({
      student_id: student.id,
      term_id: term.id,
      amount_due: fee_due,
      amount_paid: fee_paid,
      status: feeStatus(fee_due, fee_paid),
    });
    if (feeError) {
      await supabase.from("students").delete().eq("id", student.id);
      return "Could not create the term fee record. Nothing was saved.";
    }
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({ status: "accepted", student_id: student.id })
    .eq("id", id);
  if (updateError) {
    await supabase.from("students").delete().eq("id", student.id); // fee record goes with it
    return "Could not update the application. Nothing was saved.";
  }

  revalidatePath("/portal/applications");
  revalidatePath("/portal/students");
  revalidatePath("/portal/fees");
  redirect(`/portal/students/${student.id}`);
}

export async function rejectApplication(id: string) {
  await requireRole("staff");
  const supabase = await createClient();
  await supabase.from("applications").update({ status: "rejected" }).eq("id", id).eq("status", "new");
  revalidatePath("/portal/applications");
  redirect("/portal/applications");
}
