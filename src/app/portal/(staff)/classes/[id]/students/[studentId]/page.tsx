import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { requireClassAccess } from "@/lib/class-access";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { Attendance } from "@/components/barnamaj-attendance";
import { Marks } from "@/components/barnamaj-marks";
import { controlClass } from "@/components/form-parts";
import { FreshOnVisit } from "@/components/fresh-on-visit";
import { LinesSkeleton } from "@/components/page-skeleton";
import { PickerForm } from "@/components/picker-form";
import { HifzSection } from "./hifz-section";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

type Params = { id: string; studentId: string };
type Search = { term?: string; page?: string };

// The student page teachers use: who it is, Record hifz, and their hifz (or Barnamaj attendance and marks).
// Bio data stays with staff (Students → edit); only the guardian contact and medical notes are shown here.
export default async function StudentPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
  const profile = await requireRole("teacher", "staff");
  const { id, studentId } = await params;
  const sp = await searchParams;
  await requireClassAccess(profile, id);
  const supabase = await createClient();

  const [{ data: s }, { data: c }, { data: n }] = await Promise.all([
    supabase
      .from("students")
      .select("id, admission_no, full_name, full_name_ar, photo_path, guardian_name, guardian_phone")
      .eq("id", studentId)
      .eq("class_id", id)
      .maybeSingle(),
    supabase.from("classes").select("name, program").eq("id", id).maybeSingle(),
    supabase.rpc("student_notes").eq("id", studentId).maybeSingle(),
  ]);
  if (!s || !c) notFound();

  const photoUrl = s.photo_path
    ? (await supabase.storage.from("student-photos").createSignedUrl(s.photo_path, 3600)).data?.signedUrl
    : null;
  const basePath = `/portal/classes/${id}/students/${s.id}`;
  const isStaff = profile.role === "staff";

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href={`/portal/classes/${id}`} className="text-sm text-primary underline-offset-4 hover:underline">
          ← {c.name}
        </Link>

        <div className="mt-3 flex items-center gap-4">
          {photoUrl && <Image src={photoUrl} alt="" width={72} height={72} unoptimized className="size-18 rounded-xl object-cover" />}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold gold-bar">{s.full_name}</h1>
            {s.full_name_ar && (
              <p lang="ar" dir="rtl" className="font-arabic text-start text-lg">
                {s.full_name_ar}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {s.admission_no} · {c.name}
            </p>
          </div>
        </div>

        {c.program !== "barnamaj" && (
          <Link
            href={`${basePath}/hifz`}
            className="mt-5 flex h-12 items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            Record hifz
          </Link>
        )}

        <details className="mt-4 rounded-xl border bg-card shadow-sm">
          <summary className="cursor-pointer p-3 text-sm font-medium">Contact &amp; care</summary>
          <dl className="grid grid-cols-3 gap-x-2 gap-y-2 border-t p-3 text-sm">
            <dt className="text-muted-foreground">Guardian</dt>
            <dd className="col-span-2">{s.guardian_name || "—"}</dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="col-span-2">
              {s.guardian_phone ? (
                <a href={`tel:${s.guardian_phone}`} className="text-primary underline-offset-4 hover:underline">
                  {s.guardian_phone}
                </a>
              ) : (
                "—"
              )}
            </dd>
            <dt className="text-muted-foreground">Medical notes</dt>
            <dd className="col-span-2">{n?.medical_notes || "None recorded"}</dd>
          </dl>
          {isStaff && (
            <Link href={`/portal/students/${s.id}`} className="block border-t p-3 text-sm text-primary underline-offset-4 hover:underline">
              All details / edit student →
            </Link>
          )}
        </details>

        {c.program === "barnamaj" ? (
          <BarnamajSection studentId={s.id} basePath={basePath} termParam={sp.term} />
        ) : (
          <HifzSection studentId={s.id} program={c.program} basePath={basePath} isStaff={isStaff} sp={sp} />
        )}
      </div>
    </FreshOnVisit>
  );
}

// Barnamaj has no hifz: this term's attendance and exam marks instead (term picker, default = current term).
async function BarnamajSection({ studentId, basePath, termParam }: { studentId: string; basePath: string; termParam?: string }) {
  const supabase = await createClient();
  const today = todayInLagos();
  const { data: terms } = await supabase
    .from("terms")
    .select("id, number, starts_on, ends_on, academic_years(name)")
    .order("starts_on", { ascending: false });
  const list = terms ?? [];
  const term =
    list.find((t) => t.id === termParam) ?? list.find((t) => t.starts_on <= today && today <= t.ends_on) ?? list[0];
  if (!term) return <p className="mt-6 text-sm text-muted-foreground">No terms are set up yet.</p>;

  return (
    <section className="mt-6 space-y-6">
      <PickerForm action={basePath}>
        <select name="term" defaultValue={term.id} aria-label="Term" className={`${controlClass} w-full`}>
          {list.map((t) => (
            <option key={t.id} value={t.id}>{t.academic_years?.name} · Term {t.number}</option>
          ))}
        </select>
      </PickerForm>
      <Suspense key={`a-${term.id}`} fallback={<LinesSkeleton />}>
        <Attendance termId={term.id} studentId={studentId} />
      </Suspense>
      <Suspense key={`m-${term.id}`} fallback={<LinesSkeleton />}>
        <Marks termId={term.id} studentId={studentId} />
      </Suspense>
    </section>
  );
}
