import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

const FEE_LABEL: Record<string, { text: string; className: string }> = {
  unpaid: { text: "Unpaid", className: "text-destructive" },
  part: { text: "Part-paid", className: "text-amber-600" },
  paid: { text: "Paid", className: "text-primary" },
};

export default async function StudentHome() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  // RLS: a student can only read their own row.
  const { data: s } = await supabase
    .from("students")
    .select("id, admission_no, full_name, photo_path, classes(name, program)")
    .maybeSingle();

  const photoUrl = s?.photo_path
    ? (await supabase.storage.from("student-photos").createSignedUrl(s.photo_path, 3600)).data?.signedUrl
    : null;

  // Set when the student changes their own password; staff resetting it clears it (see accounts/actions.ts).
  const { data: claims } = await supabase.auth.getClaims();
  const ownPassword = claims?.claims.user_metadata?.password_changed === true;

  return (
    <div className="max-w-xl space-y-6">
      {!ownPassword && (
        <p className="rounded-lg border border-amber-500/50 bg-green-500/10 p-3 text-sm">
          You are using the password the school gave you. You can set your own in{" "}
          <Link href="/portal/student/profile#password" className="font-medium text-primary underline-offset-4 hover:underline">
            your profile
          </Link>
          .
        </p>
      )}
      <div className="flex items-center gap-4">
        {photoUrl && (
          <Image src={photoUrl} alt="" width={80} height={80} unoptimized className="size-20 rounded-lg object-cover" />
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Assalamu alaykum, {profile.full_name}</h1>
          {s && <p className="text-sm text-muted-foreground">Admission no. {s.admission_no}</p>}
        </div>
      </div>

      {!s && <p className="text-sm text-muted-foreground">Your student record is not linked yet. Please ask the office.</p>}

      {s && (
        <>
          <Suspense fallback={null}>
            <ClassCard name={s.classes?.name ?? null} program={s.classes?.program ?? null} />
          </Suspense>
          <Suspense fallback={null}>
            <TermAndFees studentId={s.id} />
          </Suspense>
          <Suspense fallback={null}>
            <Announcements />
          </Suspense>
          {(s.classes?.program === "tahfiz" || s.classes?.program === "maahad") && (
            <Link
              href="/portal/student/hifz"
              className="flex h-11 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
            >
              My hifz progress
            </Link>
          )}
          {s.classes?.program === "barnamaj" && (
            <Link
              href="/portal/student/barnamaj"
              className="flex h-11 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
            >
              My Barnamaj record
            </Link>
          )}
          <Link
            href="/portal/student/profile"
            className="flex h-11 items-center justify-center rounded-md border text-sm font-medium hover:bg-muted"
          >
            My profile
          </Link>
        </>
      )}
    </div>
  );
}

async function ClassCard({ name, program }: { name: string | null; program: string | null }) {
  const supabase = await createClient();
  const { data: names } = await supabase.rpc("my_class_teacher_names");

  return (
    <section className="rounded-lg border p-4">
      <h2 className="font-semibold">My class</h2>
      <p className="mt-1 text-sm">
        {name ?? "No class yet"}
        {program && <span className="capitalize text-muted-foreground"> · {program}</span>}
      </p>
      {!!names?.length && (
        <p className="mt-1 text-sm text-muted-foreground">
          {names.length > 1 ? "Teachers" : "Teacher"}: {names.join(", ")}
        </p>
      )}
    </section>
  );
}

async function TermAndFees({ studentId }: { studentId: string }) {
  const supabase = await createClient();
  const today = todayInLagos();
  const { data: term } = await supabase
    .from("terms")
    .select("id, number, starts_on, ends_on, academic_years(name)")
    .lte("starts_on", today)
    .gte("ends_on", today)
    .maybeSingle();

  if (!term) {
    return (
      <section className="rounded-lg border p-4">
        <h2 className="font-semibold">This term</h2>
        <p className="mt-1 text-sm text-muted-foreground">No term is running today.</p>
      </section>
    );
  }

  const { data: fee } = await supabase
    .from("student_fees")
    .select("status")
    .eq("student_id", studentId)
    .eq("term_id", term.id)
    .maybeSingle();
  const label = fee ? FEE_LABEL[fee.status] : null;

  return (
    <section className="rounded-lg border p-4">
      <h2 className="font-semibold">
        Term {term.number} · {term.academic_years?.name}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {term.starts_on} to {term.ends_on}
      </p>
      <p className="mt-2 text-sm">
        School fees:{" "}
        {label ? (
          <span className={`font-medium ${label.className}`}>{label.text}</span>
        ) : (
          <span className="text-muted-foreground">No fee record yet</span>
        )}
        {" · "}
        <Link href="/portal/student/fees" className="text-primary underline-offset-4 hover:underline">
          Details &amp; proof of payment
        </Link>
      </p>
    </section>
  );
}

async function Announcements() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, published_at")
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Announcements</h2>
        <Link href="/portal/student/news" className="text-sm text-primary underline-offset-4 hover:underline">
          All news
        </Link>
      </div>
      <ul className="mt-2 divide-y rounded-lg border">
        {(posts ?? []).map((p) => (
          <li key={p.id} className="flex items-start justify-between gap-3 p-3 text-sm">
            <Link href={`/portal/student/news/${p.id}`} className="min-w-0 text-primary underline-offset-4 hover:underline">
              {p.title}
            </Link>
            {p.published_at && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(p.published_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
              </span>
            )}
          </li>
        ))}
        {!posts?.length && <li className="p-3 text-sm text-muted-foreground">Nothing yet.</li>}
      </ul>
    </section>
  );
}
