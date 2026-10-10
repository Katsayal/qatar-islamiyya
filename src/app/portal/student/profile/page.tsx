import Image from "next/image";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CorrectionForm } from "./correction-form";
import { PasswordForm } from "./password-form";

export default async function StudentProfilePage() {
  await requireRole("student");
  const supabase = await createClient();

  // RLS: a student can only read their own row and their own requests.
  const [{ data: s }, { data: requests }] = await Promise.all([
    supabase.from("students").select("*, classes(name)").maybeSingle(),
    supabase
      .from("correction_requests")
      .select("id, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  if (!s) return <p className="text-sm text-muted-foreground">Your student record is not linked yet. Please ask the office.</p>;

  const photoUrl = s.photo_path
    ? (await supabase.storage.from("student-photos").createSignedUrl(s.photo_path, 3600)).data?.signedUrl
    : null;

  const rows: [string, string | null][] = [
    ["Admission no.", s.admission_no],
    ["Class", s.classes?.name ?? null],
    ["Gender", s.gender],
    ["Date of birth", s.date_of_birth],
    ["Blood group", s.blood_group],
    ["Admitted on", s.admitted_on],
    ["Address", s.address],
    ["Local government", s.local_government],
    ["Previous Islamiyya", s.previous_islamiyya],
    ["Student phone", s.student_phone],
    ["Guardian", s.guardian_name],
    ["Guardian phone", s.guardian_phone],
    ["Guardian address", [s.guardian_address, s.guardian_local_government].filter(Boolean).join(", ")],
  ];

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        {photoUrl && (
          <Image src={photoUrl} alt="" width={80} height={80} unoptimized className="size-20 rounded-lg object-cover" />
        )}
        <div>
          <h1 className="text-xl font-semibold">{s.full_name}</h1>
          {s.full_name_ar && (
            <p lang="ar" dir="rtl" className="font-arabic text-lg">
              {s.full_name_ar}
            </p>
          )}
        </div>
      </div>

      <dl className="divide-y rounded-lg border">
        {rows
          .filter(([, v]) => v)
          .map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-2 p-3 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="col-span-2">{value}</dd>
            </div>
          ))}
      </dl>

      <section id="password">
        <h2 className="font-semibold">My password</h2>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Set your own password so nobody else can sign in as you. If you forget it, ask the office to reset it.
        </p>
        <PasswordForm />
      </section>

      <section>
        <h2 className="font-semibold">Something wrong?</h2>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          You cannot edit your details here. Tell the office what to correct and they will fix it.
        </p>
        <CorrectionForm />
      </section>

      {!!requests?.length && (
        <section>
          <h2 className="font-semibold">My requests</h2>
          <ul className="mt-2 divide-y rounded-lg border">
            {requests.map((r) => (
              <li key={r.id} className="p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  </span>
                  <span className={`text-xs font-medium ${r.status === "done" ? "text-primary" : "text-amber-600"}`}>
                    {r.status === "done" ? "Done" : "Open"}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line">{r.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
