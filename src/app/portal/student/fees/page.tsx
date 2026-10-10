import { Suspense } from "react";
import { BankDetails } from "@/components/bank-details";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";
import { ProofForm } from "./proof-form";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const statusLabel: Record<string, { text: string; className: string }> = {
  unpaid: { text: "Unpaid", className: "text-destructive" },
  part: { text: "Part-paid", className: "text-amber-600" },
  paid: { text: "Paid", className: "text-primary" },
};
const proofLabel: Record<string, { text: string; className: string }> = {
  pending: { text: "Waiting for the office", className: "text-amber-600" },
  verified: { text: "Checked", className: "text-primary" },
  rejected: { text: "Not accepted", className: "text-destructive" },
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
      <h1 className="text-xl font-semibold">School fees</h1>

      <section>
        <ul className="space-y-3">
          {rows.map((f) => {
            const st = statusLabel[f.status];
            return (
              <li key={f.id} className="rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{f.terms?.academic_years?.name} · Term {f.terms?.number}</p>
                  <span className={`font-medium ${st?.className ?? ""}`}>{st?.text ?? f.status}</span>
                </div>
                <p className="mt-1 text-muted-foreground">
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
        <h2 className="font-semibold">Pay by bank transfer</h2>
        <Suspense fallback={null}>
          <BankDetails />
        </Suspense>
      </section>

      {!!rows.length && (
        <section>
          <h2 className="font-semibold">I have paid</h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Upload your receipt. The office checks it and updates your fees. This does not change your balance by itself.
          </p>
          <ProofForm terms={termOptions} defaultTerm={defaultTerm} />
        </section>
      )}

      {!!proofs?.length && (
        <section>
          <h2 className="font-semibold">My proofs</h2>
          <ul className="mt-2 divide-y rounded-lg border text-sm">
            {proofs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-3">
                <span>
                  {new Date(p.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })} · Term {p.terms?.number}
                </span>
                <span className={`shrink-0 text-xs font-medium ${proofLabel[p.status]?.className ?? ""}`}>
                  {proofLabel[p.status]?.text ?? p.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
