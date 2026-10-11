import { Suspense } from "react";
import { BankDetails } from "@/components/bank-details";
import { PortalTitle } from "@/components/portal-title";
import { ProgressBar } from "@/components/progress-bar";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { ProofForm } from "./proof-form";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
type Tone = "good" | "warn" | "bad";
const statusLabel: Record<string, { text: string; tone: Tone }> = {
  unpaid: { text: "Unpaid", tone: "bad" },
  part: { text: "Part-paid", tone: "warn" },
  paid: { text: "Paid", tone: "good" },
};
const proofLabel: Record<string, { text: string; tone: Tone }> = {
  pending: { text: "Waiting for the office", tone: "warn" },
  verified: { text: "Checked", tone: "good" },
  rejected: { text: "Not accepted", tone: "bad" },
};

export default async function StudentFeesPage() {
  await requireRole("student");
  const supabase = await createClient();
  const today = todayInLagos();

  // RLS: a student only reads their own fee rows and proofs.
  const [{ data: fees }, { data: proofs }, { data: current }] = await Promise.all([
    supabase
      .from("student_fees")
      .select("id, term_id, amount_due, amount_paid, status, note, terms(number, starts_on, academic_years(name))")
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_proofs")
      .select("id, status, created_at, terms(number, academic_years(name))")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("terms").select("id").lte("starts_on", today).gte("ends_on", today).maybeSingle(),
  ]);

  const rows = (fees ?? []).sort((a, b) => (b.terms?.starts_on ?? "").localeCompare(a.terms?.starts_on ?? ""));
  const termOptions = rows.map((f) => ({ id: f.term_id, label: `${f.terms?.academic_years?.name} · Term ${f.terms?.number}` }));
  const defaultTerm = termOptions.find((t) => t.id === current?.id)?.id ?? termOptions[0]?.id ?? "";

  return (
    <div className="max-w-xl space-y-6">
      <PortalTitle title="School fees" />

      <section>
        <ul className="space-y-3">
          {rows.map((f) => {
            const st = statusLabel[f.status];
            return (
              <li key={f.id} className="rounded-xl border p-4 text-sm bg-card shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{f.terms?.academic_years?.name} · Term {f.terms?.number}</p>
                  <StatusBadge tone={st?.tone ?? "warn"}>{st?.text ?? f.status}</StatusBadge>
                </div>
                <div className="mt-3">
                  <ProgressBar value={f.amount_paid} max={f.amount_due} label="Fee paid so far" />
                </div>
                <p className="mt-2 text-muted-foreground">
                  Due {naira(f.amount_due)} · Paid {naira(f.amount_paid)} · Left {naira(Math.max(0, f.amount_due - f.amount_paid))}
                </p>
                {f.note && <p className="mt-1 text-muted-foreground">{f.note}</p>}
              </li>
            );
          })}
          {!rows.length && <li className="text-sm text-muted-foreground">No fee has been set for you yet.</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Pay by bank transfer</h2>
        <Suspense fallback={null}>
          <BankDetails />
        </Suspense>
      </section>

      {!!rows.length && (
        <section>
          <h2 className="text-lg font-semibold">I have paid</h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Upload your receipt. The office checks it and updates your fees. This does not change your balance by itself.
          </p>
          <ProofForm terms={termOptions} defaultTerm={defaultTerm} />
        </section>
      )}

      {!!proofs?.length && (
        <section>
          <h2 className="text-lg font-semibold">My proofs</h2>
          <ul className="mt-2 divide-y rounded-xl border text-sm bg-card shadow-sm">
            {proofs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-3">
                <span>
                  {new Date(p.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })} · Term {p.terms?.number}
                </span>
                <StatusBadge tone={proofLabel[p.status]?.tone ?? "warn"}>
                  {proofLabel[p.status]?.text ?? p.status}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
