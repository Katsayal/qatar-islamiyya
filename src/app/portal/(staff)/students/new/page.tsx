import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StudentForm, type StudentDefaults } from "../student-form";

export default async function NewStudentPage() {
  await requireRole("staff");
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, program")
    .eq("active", true)
    .order("sort_order")
    .order("name");

  const defaults: StudentDefaults = {
    admission_no: "", full_name: "", full_name_ar: "", gender: "", date_of_birth: "",
    // Safe to read the clock: the session check above already made this request-time.
    admitted_on: new Date().toISOString().slice(0, 10),
    class_id: "", status: "active", address: "", town: "", previous_school: "", entry_level: "",
    medical_notes: "", notes: "", guardian_name: "", guardian_phone: "", guardian_address: "", guardian_town: "",
  };

  return (
    <div className="max-w-xl">
      <Link href="/portal/students" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Students
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Add student</h1>
      <div className="mt-4">
        <StudentForm defaults={defaults} classes={classes ?? []} />
      </div>
    </div>
  );
}
