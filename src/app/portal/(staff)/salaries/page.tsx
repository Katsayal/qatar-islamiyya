import { Wallet, X } from "lucide-react";
import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { currentMonth, monthLabel, monthStart } from "@/lib/months";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { SalaryForm } from "./salary-form";
import { SetMonthForm } from "./set-month-form";
import { btn } from "@/components/buttons";
import { controlClass, SearchField } from "@/components/form-parts";
import { PickerForm } from "@/components/picker-form";
import { StatusBadge } from "@/components/status-badge";
import { FreshOnVisit } from "@/components/fresh-on-visit";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const filters = [
  { key: "notpaid", label: "Not fully paid" },
  { key: "unpaid", label: "Unpaid" },
  { key: "part", label: "Part-paid" },
  { key: "paid", label: "Paid" },
  { key: "none", label: "No record" },
  { key: "all", label: "All" },
];
const roles = [
  { key: "all", label: "Teachers & staff" },
  { key: "teacher", label: "Teachers" },
  { key: "staff", label: "Staff" },
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

type Search = { month?: string; status?: string; role?: string; q?: string };

// Owner only: what each teacher / staff member (and the owner) is due and has been paid, month by month.
export default async function SalariesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireOwner();
  const sp = await searchParams;
  const month = monthStart(sp.month ?? "") ? sp.month! : currentMonth(todayInLagos());
  const status = filters.some((f) => f.key === sp.status) ? sp.status! : "notpaid";
  const role = roles.some((r) => r.key === sp.role) ? sp.role! : "all";
  const q = (sp.q ?? "").trim().toLowerCase();
  const monthDate = monthStart(month)!;
  const supabase = await createClient();

  const [{ data: people }, { data: rates }, { data: records }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, is_owner, active").in("role", ["teacher", "staff"]).order("full_name"),
    supabase.from("salary_rates").select("profile_id, monthly_amount"),
    supabase.from("salary_months").select("*").eq("month", monthDate),
  ]);
  const rate = new Map((rates ?? []).map((r) => [r.profile_id, r.monthly_amount]));
  const record = new Map((records ?? []).map((r) => [r.profile_id, r]));

  // Active people, plus anyone disabled who was paid this month. Merged in code: a few dozen people at most.
  const rows = (people ?? [])
    .filter((p) => p.active || record.has(p.id))
    .filter((p) => role === "all" || p.role === role)
    .filter((p) => !q || p.full_name.toLowerCase().includes(q))
    .map((p) => ({ p, rec: record.get(p.id), key: record.get(p.id)?.status ?? "none" }));

  const count = (k: string) => rows.filter((r) => r.key === k).length;
  const totalDue = rows.reduce((n, r) => n + (r.rec?.amount_due ?? 0), 0);
  const totalPaid = rows.reduce((n, r) => n + (r.rec?.amount_paid ?? 0), 0);
  const outstanding = rows.reduce((n, r) => n + Math.max((r.rec?.amount_due ?? 0) - (r.rec?.amount_paid ?? 0), 0), 0);
  const shown = rows.filter((r) => status === "all" || (status === "notpaid" ? r.key !== "paid" : r.key === status));

  return (
    <FreshOnVisit>
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold gold-bar">Salaries</h1>
          <Link href="/portal/salaries/rates" className={`${btn.secondary} h-10 px-3`}>
            <Wallet aria-hidden /> Salary amounts
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Owner only. Nobody else can see this page or any salary figure.</p>

        {/* key: rebuild when the URL filters change (e.g. Clear), so the boxes show what is applied */}
        <PickerForm key={[q, month, status, role].join("|")} action="/portal/salaries" className="mt-4 grid gap-3 md:grid-cols-6">
          <SearchField defaultValue={sp.q ?? ""} placeholder="Search by name" className="md:col-span-6" />
          <input name="month" type="month" required defaultValue={month} aria-label="Month" className={`${input} md:col-span-2`} />
          <select name="status" defaultValue={status} aria-label="Payment status" className={`${input} md:col-span-2`}>
            {filters.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
          <select name="role" defaultValue={role} aria-label="Role" className={input}>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          {(q || status !== "notpaid" || role !== "all") && (
            <Link href="/portal/salaries" className={`${btn.secondary} `}>
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
          {monthLabel(month)}: {count("paid")} paid · {count("part")} part-paid · {count("unpaid")} unpaid · {count("none")} no record
        </p>

        <SetMonthForm month={month} label={monthLabel(month)} />

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{shown.length} {shown.length === 1 ? "person" : "people"} shown</p>
          {/* A file download, not a page: a plain <a> is correct here. */}
          <a href={`/portal/salaries/export?month=${month}`} className="text-sm text-primary underline-offset-4 hover:underline">Export {monthLabel(month)} (CSV)</a>
        </div>
        <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
          {shown.map(({ p, rec, key }) => (
            <li key={p.id} className="p-3">
              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.full_name}</span>
                    <span className="text-sm capitalize text-muted-foreground">
                      {p.role}{p.is_owner && " · owner"}{!p.active && " · disabled"}
                    </span>
                  </span>
                  <span className="shrink-0 text-end text-sm">
                    <span className="mb-1 block"><StatusBadge tone={statusTone[key]}>{statusLabel[key]}</StatusBadge></span>
                    {rec && <span className="text-xs text-muted-foreground">{naira(rec.amount_paid)} of {naira(rec.amount_due)}</span>}
                  </span>
                </summary>
                <div className="mt-3">
                  {!rec && !rate.has(p.id) && (
                    <p className="mb-3 text-sm text-muted-foreground">
                      No salary set yet. <Link href="/portal/salaries/rates" className="text-primary underline-offset-4 hover:underline">Set the amount</Link>, or enter it below for this month only.
                    </p>
                  )}
                  {!rec && rate.has(p.id) && (
                    <p className="mb-3 text-sm text-muted-foreground">Monthly salary: {naira(rate.get(p.id)!)}. Not set for {monthLabel(month)} yet.</p>
                  )}
                  <SalaryForm
                    key={`${month}-${p.id}`} // switching the month must not keep values typed for another month
                    profileId={p.id}
                    month={month}
                    due={rec?.amount_due ?? rate.get(p.id) ?? 0}
                    paid={rec?.amount_paid ?? 0}
                    note={rec?.note ?? ""}
                  />
                </div>
              </details>
            </li>
          ))}
          {!shown.length && <li className="p-4 text-sm text-muted-foreground">Nobody matches these filters.</li>}
        </ul>
      </div>
    </FreshOnVisit>
  );
}
