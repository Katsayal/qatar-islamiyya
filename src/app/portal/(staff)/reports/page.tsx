import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { controlClass } from "@/components/form-parts";
import { FileText, Printer } from "lucide-react";
import { btn } from "@/components/buttons";
import { PickerForm } from "@/components/picker-form";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const input = controlClass;

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ term?: string; class?: string }> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: terms }, { data: classes }] = await Promise.all([
    supabase.from("terms").select("id, number, starts_on, ends_on, academic_years(name)").order("starts_on", { ascending: false }),
    supabase.from("classes").select("id, name, program").eq("active", true).order("sort_order").order("name"),
  ]);
  if (!terms?.length) {
    return (
      <div>
        <h1 className="text-2xl font-semibold gold-bar">Report cards</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an academic year first, in{" "}
          <Link href="/portal/academic" className="text-primary underline-offset-4 hover:underline">Academic setup</Link>.
        </p>
      </div>
    );
  }

  // Safe to read the clock: the session check above already made this request-time.
  const today = new Date().toISOString().slice(0, 10);
  const term = terms.find((t) => t.id === sp.term) ?? terms.find((t) => t.starts_on <= today && today <= t.ends_on) ?? terms[0];
  const chosen = (classes ?? []).find((c) => c.id === sp.class);

  const { data: students } = chosen
    ? await supabase.from("students").select("id, admission_no, full_name").eq("class_id", chosen.id).eq("status", "active").order("full_name").range(0, 1999)
    : { data: null };
  const href = (extra = "") => `/portal/reports/${chosen?.id}?term=${term.id}${extra}`;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold gold-bar">Report cards</h1>
      <PickerForm action="/portal/reports" className="mt-4 flex flex-col gap-3">
        <select name="term" defaultValue={term.id} aria-label="Term" className={input}>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>{t.academic_years?.name} · Term {t.number}</option>
          ))}
        </select>
        <select name="class" defaultValue={chosen?.id ?? ""} aria-label="Class" className={input}>
          <option value="" disabled>Choose a class…</option>
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </PickerForm>

      {chosen && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{students?.length ?? 0} active students</p>
            {!!students?.length && (
              <Link href={href()} className={btn.save}>
                <Printer aria-hidden /> Print the whole class
              </Link>
            )}
          </div>
          <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
            {(students ?? []).map((s) => (
              <li key={s.id} className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">{s.admission_no}</p>
                </div>
                <Link href={href(`&student=${s.id}`)} className={`${btn.secondary} h-10 px-3`}>
                  <FileText aria-hidden /> Open card
                </Link>
              </li>
            ))}
            {!students?.length && <li className="p-3 text-sm text-muted-foreground">No active students in this class.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
