import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { STUDENT_COLUMNS } from "@/lib/student-schema";
import { createClient } from "@/lib/supabase/server";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

type Params = { id: string; studentId: string };

export default async function StudentProfilePage({ params }: { params: Promise<Params> }) {
  const profile = await requireRole("teacher", "staff");
  const { id, studentId } = await params;
  const supabase = await createClient();

  const [{ data: s }, { data: c }, { data: n }] = await Promise.all([
    supabase.from("students").select(STUDENT_COLUMNS).eq("id", studentId).eq("class_id", id).maybeSingle(),
    supabase.from("classes").select("name, program").eq("id", id).maybeSingle(),
    supabase.rpc("student_notes").eq("id", studentId).maybeSingle(),
  ]);
  if (!s || !c) notFound();

  const photoUrl = s.photo_path
    ? (await supabase.storage.from("student-photos").createSignedUrl(s.photo_path, 3600)).data?.signedUrl
    : null;

  const rows: [string, string | null][] = [
    ["Admission no.", s.admission_no],
    ["Class", c.name],
    ["Status", s.status],
    ["Gender", s.gender],
    ["Date of birth", s.date_of_birth],
    ["Blood group", s.blood_group],
    ["Admitted on", s.admitted_on],
    ["Address", s.address],
    ["Local government", s.local_government],
    ["Previous Islamiyya", s.previous_islamiyya],
    ["Student phone", s.student_phone],
    ["Entry level", s.entry_level],
    ["Medical notes", n?.medical_notes ?? null],
    ["Notes", n?.notes ?? null],
    ["Guardian", s.guardian_name],
    ["Guardian address", [s.guardian_address, s.guardian_local_government].filter(Boolean).join(", ")],
  ];

  return (
    <div className="max-w-xl">
      <Link href={`/portal/classes/${id}`} className="text-sm text-primary underline-offset-4 hover:underline">
        ← {c.name}
      </Link>

      <div className="mt-3 flex items-center gap-4">
        {photoUrl && (
          <Image src={photoUrl} alt="" width={80} height={80} unoptimized className="size-20 rounded-lg object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-semibold gold-bar">{s.full_name}</h1>
          {s.full_name_ar && (
            <p lang="ar" dir="rtl" className="font-arabic text-lg">
              {s.full_name_ar}
            </p>
          )}
        </div>
      </div>

      {c.program !== "barnamaj" && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href={`/portal/classes/${id}/students/${s.id}/hifz`}
            className="flex h-12 items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            Record hifz
          </Link>
          <Link
            href={`/portal/classes/${id}/students/${s.id}/hifz/history`}
            className="flex h-12 items-center justify-center rounded-lg border font-medium hover:bg-muted bg-card"
          >
            Hifz history
          </Link>
        </div>
      )}

      <dl className="mt-5 divide-y rounded-xl border bg-card shadow-sm">
        {rows
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-2 p-3 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="col-span-2">{value}</dd>
            </div>
          ))}
        {s.guardian_phone && (
          <div className="grid grid-cols-3 gap-2 p-3 text-sm">
            <dt className="text-muted-foreground">Guardian phone</dt>
            <dd className="col-span-2">
              <a href={`tel:${s.guardian_phone}`} className="text-primary underline-offset-4 hover:underline">
                {s.guardian_phone}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {profile.role === "staff" && (
        <Link
          href={`/portal/students/${s.id}`}
          className="mt-5 flex h-11 items-center justify-center rounded-lg border text-sm font-medium hover:bg-muted bg-card"
        >
          Edit student
        </Link>
      )}
    </div>
  );
}
