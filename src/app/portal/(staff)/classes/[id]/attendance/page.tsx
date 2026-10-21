import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { type Status } from "@/lib/attendance";
import { requireClassAccess } from "@/lib/class-access";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { AttendanceForm } from "./attendance-form";
import { controlClass } from "@/components/form-parts";
import { FreshOnVisit } from "@/components/fresh-on-visit";
import { PickerForm } from "@/components/picker-form";
import { DualDate } from "@/components/dual-date";
import { getHijriOffsets } from "@/lib/hijri-offsets";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const input = controlClass;

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const profile = await requireRole("teacher", "staff");
  const { id } = await params;
  const sp = await searchParams;
  await requireClassAccess(profile, id);
  const supabase = await createClient();

  const today = todayInLagos();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") && new Date(`${sp.date}T00:00:00Z`).toISOString().slice(0, 10) === sp.date;
  const date = valid && sp.date! <= today ? sp.date! : today;

  const [{ data: c }, { data: students }, { data: saved }] = await Promise.all([
    supabase.from("classes").select("name, program").eq("id", id).maybeSingle(),
    supabase.from("students").select("id, admission_no, full_name").eq("class_id", id).eq("status", "active").order("full_name"),
    supabase.from("attendance").select("student_id, status").eq("att_date", date),
  ]);
  if (!c || c.program !== "barnamaj") notFound();

  const initial = Object.fromEntries((saved ?? []).map((r) => [r.student_id, r.status as Status]));
  const list = students ?? [];

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href={`/portal/classes/${id}`} className="text-sm text-primary underline-offset-4 hover:underline">
          ← {c.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold gold-bar">Attendance</h1>

        <PickerForm action={`/portal/classes/${id}/attendance`} className="mt-4 flex gap-2">
          <input name="date" type="date" max={today} defaultValue={date} required className={`${input} min-w-0 flex-1`} />
        </PickerForm>
        <DualDate iso={date} offsets={await getHijriOffsets()} weekday className="mt-2 font-semibold" />

        {list.some((s) => initial[s.id]) && (
          <p className="mt-3 text-sm text-muted-foreground">Attendance was already taken for this day. Saving updates it.</p>
        )}

        <div className="mt-4">
          {list.length ? (
            <AttendanceForm key={date} classId={id} date={date} students={list} initial={initial} />
          ) : (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No active students in this class.</p>
          )}
        </div>
      </div>
    </FreshOnVisit>
  );
}
