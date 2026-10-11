import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

// Fee status of ACTIVE students for the current term (the term whose dates contain today).
export async function DashboardFees() {
  const supabase = await createClient();
  const today = todayInLagos();

  const { data: term } = await supabase
    .from("terms")
    .select("id, number, academic_years(name)")
    .lte("starts_on", today)
    .gte("ends_on", today)
    .maybeSingle();
  if (!term) {
    return (
      <section>
        <h2 className="text-lg font-semibold">Fees</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No term contains today&apos;s date. Check{" "}
          <Link href="/portal/academic" className="text-primary underline-offset-4 hover:underline">Academic setup</Link>.
        </p>
      </section>
    );
  }

  const withStatus = (status: string) =>
    supabase
      .from("student_fees")
      .select("id, students!inner(status)", { count: "exact", head: true })
      .eq("term_id", term.id)
      .eq("status", status)
      .eq("students.status", "active");
  const [unpaid, part, paid, active] = await Promise.all([
    withStatus("unpaid"),
    withStatus("part"),
    withStatus("paid"),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);
  const noRecord = Math.max(0, (active.count ?? 0) - (unpaid.count ?? 0) - (part.count ?? 0) - (paid.count ?? 0));

  const tile = "block rounded-xl border bg-card p-3 shadow-sm transition-colors hover:border-primary";
  const link = (status: string) => `/portal/fees?term=${term.id}&status=${status}`;
  return (
    <section>
      <h2 className="text-lg font-semibold">Fees</h2>
      <p className="text-sm text-muted-foreground">
        {term.academic_years?.name} · Term {term.number}
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        <li>
          <Link href={link("unpaid")} className={tile}>
            <p className="text-2xl font-semibold text-destructive">{unpaid.count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Unpaid</p>
          </Link>
        </li>
        <li>
          <Link href={link("part")} className={tile}>
            <p className="text-2xl font-semibold text-amber-600">{part.count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Part-paid</p>
          </Link>
        </li>
        <li>
          <Link href={link("paid")} className={tile}>
            <p className="text-2xl font-semibold text-primary">{paid.count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </Link>
        </li>
        <li>
          <Link href={link("none")} className={tile}>
            <p className="text-2xl font-semibold">{noRecord}</p>
            <p className="text-xs text-muted-foreground">No fee record</p>
          </Link>
        </li>
      </ul>
    </section>
  );
}
