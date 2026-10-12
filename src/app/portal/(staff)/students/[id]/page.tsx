import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { STUDENT_COLUMNS } from "@/lib/student-schema";
import { createClient } from "@/lib/supabase/server";
import { DeleteStudent } from "../delete-student";
import { setStatus } from "../actions";
import { StudentForm, type StudentDefaults } from "../student-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";
import { Archive, ArchiveRestore } from "lucide-react";
import { btn } from "@/components/buttons";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("staff");
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: s }, { data: n }, { data: classes }] = await Promise.all([
    supabase.from("students").select(STUDENT_COLUMNS).eq("id", id).maybeSingle(),
    supabase.rpc("student_notes").eq("id", id).maybeSingle(),
    supabase.from("classes").select("id, name, program").eq("active", true).order("sort_order").order("name"),
  ]);
  if (!s) notFound();

  const photoUrl = s.photo_path
    ? (await supabase.storage.from("student-photos").createSignedUrl(s.photo_path, 3600)).data?.signedUrl
    : null;

  const v = (x: string | number | null) => (x == null ? "" : String(x));
  const defaults: StudentDefaults = {
    id: s.id,
    photoUrl,
    admission_no: s.admission_no,
    full_name: s.full_name,
    full_name_ar: v(s.full_name_ar),
    gender: s.gender,
    date_of_birth: v(s.date_of_birth),
    admitted_on: v(s.admitted_on),
    class_id: v(s.class_id),
    status: s.status,
    address: v(s.address),
    local_government: v(s.local_government),
    previous_islamiyya: v(s.previous_islamiyya),
    blood_group: v(s.blood_group),
    student_phone: v(s.student_phone),
    entry_level: v(s.entry_level),
    medical_notes: v(n?.medical_notes ?? null),
    notes: v(n?.notes ?? null),
    guardian_name: v(s.guardian_name),
    guardian_phone: v(s.guardian_phone),
    guardian_address: v(s.guardian_address),
    guardian_local_government: v(s.guardian_local_government),
  };
  const archived = s.status === "archived";

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href="/portal/students" className="text-sm text-primary underline-offset-4 hover:underline">
          ← Students
        </Link>
        <h1 className="mt-2 text-2xl font-semibold gold-bar">{s.full_name}</h1>
        <div className="mt-4">
          <StudentForm defaults={defaults} classes={classes ?? []} />
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <form action={setStatus.bind(null, s.id, archived ? "active" : "archived")}>
            <button className={`${btn.secondary} w-full`}>
              {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />} {archived ? "Restore student" : "Archive student"}
            </button>
          </form>
          <DeleteStudent id={s.id} admissionNo={s.admission_no} />
        </div>
      </div>
    </FreshOnVisit>
  );
}
