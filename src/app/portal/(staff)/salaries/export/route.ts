import { requireOwner } from "@/lib/auth";
import { monthStart } from "@/lib/months";
import { toCsv } from "@/lib/students-csv";
import { createClient } from "@/lib/supabase/server";

// GET /portal/salaries/export?month=2026-10 -> that month; no month -> every month. Owner only.
export async function GET(request: Request) {
  await requireOwner();
  const monthParam = new URL(request.url).searchParams.get("month");
  const monthDate = monthParam ? monthStart(monthParam) : null;
  if (monthParam && !monthDate) return new Response("Bad month", { status: 400 });

  const supabase = await createClient();
  let query = supabase
    .from("salary_months")
    .select("month, amount_due, amount_paid, status, note, profiles!salary_months_profile_id_fkey(full_name, role)")
    .order("month", { ascending: false })
    .range(0, 9999);
  if (monthDate) query = query.eq("month", monthDate);
  const { data } = await query;

  const records = (data ?? []).sort(
    (a, b) => b.month.localeCompare(a.month) || (a.profiles?.full_name ?? "").localeCompare(b.profiles?.full_name ?? ""),
  );
  const rows: string[][] = [["name", "role", "month", "amount_due", "amount_paid", "outstanding", "status", "note"]];
  for (const r of records) {
    rows.push([
      r.profiles?.full_name ?? "",
      r.profiles?.role ?? "",
      r.month.slice(0, 7),
      String(r.amount_due),
      String(r.amount_paid),
      String(Math.max(r.amount_due - r.amount_paid, 0)),
      r.status,
      r.note ?? "",
    ]);
  }

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="salaries-${monthParam ?? "all"}.csv"`,
    },
  });
}
