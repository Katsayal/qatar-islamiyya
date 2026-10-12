import { Receipt, X } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FeeForm } from "./fee-form";
import { TermFeeForm } from "./term-fee-form";
import { btn } from "@/components/buttons";
import { controlClass, SearchField } from "@/components/form-parts";
import { PickerForm } from "@/components/picker-form";
import { StatusBadge } from "@/components/status-badge";
import { FreshOnVisit } from "@/components/fresh-on-visit";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const PAGE_SIZE = 25;
const programs = [
  { key: "tahfiz", label: "Tahfiz" },
  { key: "maahad", label: "Ma'ahad" },
  { key: "barnamaj", label: "Barnamaj" },
];
const filters = [
  { key: "notpaid", label: "Not fully paid" },
  { key: "unpaid", label: "Unpaid" },
  { key: "part", label: "Part-paid" },
  { key: "paid", label: "Paid" },
  { key: "none", label: "No record" },
  { key: "all", label: "All" },
];
const statusLabel: Record<string, string> = { paid: "Paid", part: "Part-paid", unpaid: "Unpaid", none: "No record" };
const statusTone: Record<string, "good" | "warn" | "bad" | "muted"> = {
  paid: "good",
  part: "warn",
  unpaid: "bad",
  none: "muted",
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const input = controlClass;

type Search = { term?: string; status?: string; program?: string; class?: string; q?: string; page?: string };

export default async function FeesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: terms } = await supabase
    .from("terms")
    .select("id, number, starts_on, ends_on, academic_years(name)")
    .order("starts_on", { ascending: false });
  if (!terms?.length) {
    return (
      <div>
        <h1 className="text-2xl font-semibold gold-bar">Fees</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an academic year first, in{" "}
          <Link href="/portal/academic" className="text-primary underline-offset-4 hover:underline">Academic setup</Link>.
        </p>
      </div>
    );
  }

  // Safe to read the clock: the session check above already made this request-time.
  const today = new Date().toISOString().slice(0, 10);
  const term =
    terms.find((t) => t.id === sp.term) ?? terms.find((t) => t.starts_on <= today && today <= t.ends_on) ?? terms[0];

  const q = (sp.q ?? "").replace(/[%,()*]/g, " ").trim();
  const program = programs.some((p) => p.key === sp.program) ? sp.program : undefined;
  const status = filters.some((f) => f.key === sp.status) ? sp.status! : "notpaid";
  const page = Math.max(1, Number(sp.page) || 1);

  const { data: classes } = await supabase.from("classes").select("id, name, program").order("sort_order").order("name");
  const classById = new Map((classes ?? []).map((c) => [c.id, c]));

  let studentQuery = supabase
    .from("students")
    .select("id, admission_no, full_name, class_id")
    .eq("status", "active")
    .order("full_name")
    .range(0, 1999);
  if (q) studentQuery = studentQuery.or(`full_name.ilike.%${q}%,admission_no.ilike.%${q}%`);
  if (sp.class) studentQuery = studentQuery.eq("class_id", sp.class);
  else if (program) {
    studentQuery = studentQuery.in("class_id", (classes ?? []).filter((c) => c.program === program).map((c) => c.id));
  }
  const [{ data: students }, { data: fees }] = await Promise.all([
    studentQuery,
    supabase.from("student_fees").select("*").eq("term_id", term.id).range(0, 1999),
  ]);

  // Merge in code: simple, and correct at this school's size (up to 2,000 students).
  const feeByStudent = new Map((fees ?? []).map((f) => [f.student_id, f]));
  const rows = (students ?? []).map((s) => {
    const fee = feeByStudent.get(s.id);
    return { s, fee, key: fee?.status ?? "none" };
  });

  const count = (k: string) => rows.filter((r) => r.key === k).length;
  const totalDue = rows.reduce((n, r) => n + (r.fee?.amount_due ?? 0), 0);
  const totalPaid = rows.reduce((n, r) => n + (r.fee?.amount_paid ?? 0), 0);
  const outstanding = rows.reduce((n, r) => n + Math.max((r.fee?.amount_due ?? 0) - (r.fee?.amount_paid ?? 0), 0), 0);

  const shown = rows.filter((r) => status === "all" || (status === "notpaid" ? r.key !== "paid" : r.key === status));
  const lastPage = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const pageRows = shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (n: number) => {
    const params = new URLSearchParams({ term: term.id, status, page: String(n) });
    for (const [k, v] of Object.entries({ q, program, class: sp.class })) if (v) params.set(k, v);
    return `/portal/fees?${params}`;
  };

  const { count: pendingProofs } = await supabase
    .from("payment_proofs")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <FreshOnVisit>
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold gold-bar">Fees</h1>
          <Link href="/portal/fees/proofs" className={`${btn.secondary} h-10 px-3`}>
            <Receipt aria-hidden /> Payment proofs ({pendingProofs ?? 0})
          </Link>
        </div>

        {/* key: rebuild when the URL filters change (e.g. Clear), so the boxes show what is applied */}
        <PickerForm key={[q, term.id, status, program, sp.class].join("|")} action="/portal/fees" className="mt-4 grid gap-3 md:grid-cols-6">
          <SearchField defaultValue={q} className="md:col-span-6" />
          <select name="term" defaultValue={term.id} aria-label="Term" className={`${input} md:col-span-2`}>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.academic_years?.name} · Term {t.number}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={status} aria-label="Payment status" className={input}>
            {filters.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
          <select name="program" defaultValue={program ?? ""} aria-label="Program" className={input}>
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
          <select name="class" defaultValue={sp.class ?? ""} aria-label="Class" className={input}>
            <option value="">All classes</option>
            {(classes ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {(q || program || sp.class || status !== "notpaid") && (
            <Link href="/portal/fees" className={`${btn.secondary} `}>
              <X aria-hidden /> Clear
            </Link>
          )}
        </PickerForm>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl border p-3 bg-card shadow-sm"><dt className="text-muted-foreground">Due</dt><dd className="font-medium">{naira(totalDue)}</dd></div>
          <div className="rounded-xl border p-3 bg-card shadow-sm"><dt className="text-muted-foreground">Paid</dt><dd className="font-medium">{naira(totalPaid)}</dd></div>
          <div className="rounded-xl border p-3 bg-card shadow-sm"><dt className="text-muted-foreground">Outstanding</dt><dd className="font-medium">{naira(outstanding)}</dd></div>
        </dl>
        <p className="mt-2 text-sm text-muted-foreground">
          {count("paid")} paid · {count("part")} part-paid · {count("unpaid")} unpaid · {count("none")} no record
          {" "}(active students matching the program, class and search)
        </p>

        <TermFeeForm termId={term.id} />

        <p className="mt-4 text-sm text-muted-foreground">{shown.length} student{shown.length === 1 ? "" : "s"} shown</p>
        <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
          {pageRows.map(({ s, fee, key }) => {
            const c = s.class_id ? classById.get(s.class_id) : undefined;
            return (
              <li key={s.id} className="p-3">
                <details>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{s.full_name}</span>
                      <span className="text-sm text-muted-foreground">{s.admission_no} · {c?.name ?? "No class"}</span>
                    </span>
                    <span className="shrink-0 text-end text-sm">
                      <span className="mb-1 block"><StatusBadge tone={statusTone[key]}>{statusLabel[key]}</StatusBadge></span>
                      {fee && <span className="text-xs text-muted-foreground">{naira(fee.amount_paid)} of {naira(fee.amount_due)}</span>}
                    </span>
                  </summary>
                  <div className="mt-3">
                    <FeeForm
                      key={`${term.id}-${s.id}`} // switching the term must not keep values typed for another term
                      studentId={s.id}
                      termId={term.id}
                      due={fee?.amount_due ?? 0}
                      paid={fee?.amount_paid ?? 0}
                      note={fee?.note ?? ""}
                    />
                  </div>
                </details>
              </li>
            );
          })}
          {!pageRows.length && <li className="p-4 text-sm text-muted-foreground">No students match these filters.</li>}
        </ul>

        {lastPage > 1 && (
          <nav className="mt-4 flex items-center justify-between text-sm">
            {page > 1 ? <Link href={pageHref(page - 1)} className="inline-flex h-11 items-center rounded-lg border bg-card px-4 font-medium text-primary hover:border-primary">← Previous</Link> : <span />}
            <span className="text-muted-foreground">Page {page} of {lastPage}</span>
            {page < lastPage ? <Link href={pageHref(page + 1)} className="inline-flex h-11 items-center rounded-lg border bg-card px-4 font-medium text-primary hover:border-primary">Next →</Link> : <span />}
          </nav>
        )}
      </div>
    </FreshOnVisit>
  );
}
