import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setProofStatus } from "./actions";

const PAGE_SIZE = 25;
const filters = ["pending", "verified", "rejected", "all"];
const statusLabel: Record<string, { text: string; className: string }> = {
  pending: { text: "Pending", className: "text-amber-600" },
  verified: { text: "Verified", className: "text-primary" },
  rejected: { text: "Rejected", className: "text-destructive" },
};
const button = "h-10 rounded-md border px-4 text-sm hover:bg-muted";

export default async function PaymentProofsPage({ searchParams }: { searchParams: Promise<{ show?: string; page?: string }> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const show = filters.includes(sp.show ?? "") ? sp.show! : "pending";
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("payment_proofs")
    .select("id, file_path, status, created_at, term_id, students(id, full_name, admission_no), terms(number, academic_years(name))", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (show !== "all") query = query.eq("status", show);
  const { data: proofs, count } = await query;

  // Short-lived links; the files are in a private bucket.
  const urls = new Map<string, string>();
  await Promise.all(
    (proofs ?? []).map(async (p) => {
      const { data } = await supabase.storage.from("private").createSignedUrl(p.file_path, 300);
      if (data?.signedUrl) urls.set(p.id, data.signedUrl);
    }),
  );

  const lastPage = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const pageHref = (n: number) => `?${new URLSearchParams({ show, page: String(n) })}`;

  return (
    <div className="max-w-2xl">
      <Link href="/portal/fees" className="text-sm text-primary underline-offset-4 hover:underline">← Fees</Link>
      <h1 className="mt-2 text-xl font-semibold">Payment proofs</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Receipts uploaded by students. Check the receipt against the bank, mark it, then record the payment on the Fees page.
      </p>

      <nav className="mt-3 flex flex-wrap gap-2 text-sm">
        {filters.map((f) => (
          <Link
            key={f}
            href={`/portal/fees/proofs?show=${f}`}
            className={`rounded-full border px-3 py-1 capitalize ${f === show ? "bg-primary text-primary-foreground" : ""}`}
          >
            {f}
          </Link>
        ))}
      </nav>

      <ul className="mt-4 space-y-3">
        {(proofs ?? []).map((p) => {
          const url = urls.get(p.id);
          const isPdf = p.file_path.endsWith(".pdf");
          const st = statusLabel[p.status];
          return (
            <li key={p.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {p.students ? (
                    <Link href={`/portal/students/${p.students.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                      {p.students.full_name}
                    </Link>
                  ) : (
                    <p className="font-medium">Unknown student</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {p.students?.admission_no} · {p.terms?.academic_years?.name} Term {p.terms?.number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  </p>
                </div>
                <span className={`shrink-0 text-sm font-medium ${st?.className ?? ""}`}>{st?.text ?? p.status}</span>
              </div>

              {url && (
                <a href={url} target="_blank" rel="noreferrer" className="mt-3 block">
                  {isPdf ? (
                    <span className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted">Open PDF</span>
                  ) : (
                    <Image src={url} alt="Proof of payment" width={320} height={320} unoptimized className="max-h-64 w-auto rounded-md border object-contain" />
                  )}
                </a>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {p.status !== "verified" && (
                  <form action={setProofStatus.bind(null, p.id, "verified")}>
                    <button className={`${button} bg-primary text-primary-foreground hover:bg-primary/90`}>Verify</button>
                  </form>
                )}
                {p.status !== "rejected" && (
                  <form action={setProofStatus.bind(null, p.id, "rejected")}>
                    <button className={button}>Reject</button>
                  </form>
                )}
                {p.status !== "pending" && (
                  <form action={setProofStatus.bind(null, p.id, "pending")}>
                    <button className={button}>Back to pending</button>
                  </form>
                )}
                {p.students && (
                  <Link href={`/portal/fees?term=${p.term_id}&q=${encodeURIComponent(p.students.admission_no)}&status=all`} className={`${button} flex items-center`}>
                    Record payment
                  </Link>
                )}
              </div>
            </li>
          );
        })}
        {!proofs?.length && <li className="text-sm text-muted-foreground">No proofs here.</li>}
      </ul>

      {lastPage > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)} className="rounded-md border px-4 py-2">← Newer</Link> : <span />}
          <span className="text-muted-foreground">Page {page} of {lastPage}</span>
          {page < lastPage ? <Link href={pageHref(page + 1)} className="rounded-md border px-4 py-2">Older →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
