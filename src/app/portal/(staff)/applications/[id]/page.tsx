import Link from "next/link";
import { notFound } from "next/navigation";
import { TERM_FEE_NAIRA } from "@/content/admissions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { rejectApplication } from "../actions";
import { AcceptForm } from "./accept-form";

const programLabel: Record<string, string> = { tahfiz: "Tahfiz", maahad: "Ma'ahad", barnamaj: "Barnamaj" };

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("staff");
  const { id } = await params;
  const supabase = await createClient();

  const { data: a } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
  if (!a) notFound();

  // Safe to read the clock: the session check above already made this request-time.
  const today = new Date().toISOString().slice(0, 10);
  const { data: term } =
    a.status === "new"
      ? await supabase.from("terms").select("number, academic_years(name)").lte("starts_on", today).gte("ends_on", today).maybeSingle()
      : { data: null };

  const [photo, classes] = await Promise.all([
    a.photo_path ? supabase.storage.from("student-photos").createSignedUrl(a.photo_path, 3600) : null,
    a.status === "new"
      ? supabase.from("classes").select("id, name").eq("program", a.program).eq("active", true).order("sort_order").order("name")
      : null,
  ]);

  const rows: [string, string | null][] = [
    ["Program", programLabel[a.program] ?? a.program],
    ["Gender", a.gender],
    ["Date of birth", a.date_of_birth],
    ["Blood group", a.blood_group],
    ["Level of study", a.entry_level],
    ["Previous Islamiyya", a.previous_islamiyya],
    ["Address", a.address],
    ["Local government", a.local_government],
    ["Student phone", a.student_phone],
    ["Medical condition", a.medical_notes],
    ["Notes", a.notes],
    ["Guardian", a.guardian_name],
    ["Guardian phone", a.guardian_phone],
    ["Guardian address", [a.guardian_address, a.guardian_local_government].filter(Boolean).join(", ") || null],
    ["Received", new Date(a.created_at).toLocaleDateString("en-GB", { dateStyle: "long" })],
  ];

  return (
    <div className="max-w-xl">
      <Link href="/portal/applications" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Applications
      </Link>
      <h1 className="mt-2 text-2xl font-semibold gold-bar">{a.full_name}</h1>
      <p className="text-sm capitalize text-muted-foreground">{a.status}</p>

      {photo?.data?.signedUrl && (
        // Private signed URL: a plain <img> keeps it out of the image optimizer cache.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.data.signedUrl} alt="Applicant" className="mt-4 size-28 rounded-lg object-cover" />
      )}

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="first-letter:uppercase">{v || "—"}</dd>
          </div>
        ))}
      </dl>

      {a.status === "accepted" && a.student_id && (
        <p className="mt-6 text-sm">
          <Link href={`/portal/students/${a.student_id}`} className="text-primary underline-offset-4 hover:underline">
            Open the student record →
          </Link>
        </p>
      )}

      {a.status === "new" && (
        <div className="mt-8 flex flex-col gap-4">
          <div className="rounded-xl border p-4 bg-card shadow-sm">
            <h2 className="mb-3 font-semibold">Accept</h2>
            <AcceptForm
              id={a.id}
              classes={classes?.data ?? []}
              today={today}
              term={term ? `${term.academic_years?.name} · Term ${term.number}` : null}
              termFee={TERM_FEE_NAIRA}
            />
          </div>
          <details className="rounded-xl border border-destructive/40 p-4">
            <summary className="cursor-pointer text-sm font-medium text-destructive">Reject this application…</summary>
            <form action={rejectApplication.bind(null, a.id)} className="mt-3">
              <button className="h-11 w-full rounded-lg bg-destructive px-4 text-sm font-medium text-white">
                Reject application
              </button>
            </form>
          </details>
        </div>
      )}
    </div>
  );
}
