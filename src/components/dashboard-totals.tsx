import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const programs = [
  { key: "tahfiz", label: "Tahfiz" },
  { key: "maahad", label: "Ma'ahad" },
  { key: "barnamaj", label: "Barnamaj" },
];

// Counts only (head requests): no rows come back, so the API's 1,000-row cap never applies.
export async function DashboardTotals() {
  const supabase = await createClient();
  const active = () => supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active");

  const [{ data: classes }, total, boys, girls] = await Promise.all([
    supabase.from("classes").select("id, name, program").eq("active", true).order("sort_order").order("name"),
    active(),
    active().eq("gender", "male"),
    active().eq("gender", "female"),
  ]);
  const perClass = await Promise.all(
    (classes ?? []).map(async (c) => ({ ...c, count: (await active().eq("class_id", c.id)).count ?? 0 })),
  );
  const inClasses = perClass.reduce((sum, c) => sum + c.count, 0);
  const unassigned = (total.count ?? 0) - inClasses; // no class, or a deactivated class

  return (
    <section>
      <h2 className="font-semibold">Students</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        <span className="text-2xl font-semibold text-foreground">{total.count ?? 0}</span> active · {boys.count ?? 0} {boys.count === 1 ? "boy" : "boys"} · {girls.count ?? 0} {girls.count === 1 ? "girl" : "girls"}
      </p>

      <ul className="mt-3 grid grid-cols-3 gap-3">
        {programs.map((p) => (
          <li key={p.key}>
            <Link href={`/portal/students?program=${p.key}`} className="block rounded-lg border p-3 hover:bg-muted">
              <p className="text-xl font-semibold">{perClass.filter((c) => c.program === p.key).reduce((sum, c) => sum + c.count, 0)}</p>
              <p className="text-xs text-muted-foreground">{p.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      {perClass.length > 0 && (
        <ul className="mt-3 divide-y rounded-lg border text-sm">
          {perClass.map((c) => (
            <li key={c.id}>
              <Link href={`/portal/classes/${c.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-muted">
                <span className="min-w-0 truncate">
                  {c.name} <span className="text-xs capitalize text-muted-foreground">· {c.program}</span>
                </span>
                <span className="font-medium">{c.count}</span>
              </Link>
            </li>
          ))}
          {unassigned > 0 && (
            <li className="flex items-center justify-between gap-3 p-3 text-muted-foreground">
              <span>No class</span>
              <span className="font-medium">{unassigned}</span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
