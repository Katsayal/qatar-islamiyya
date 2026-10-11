import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const statuses = ["new", "accepted", "rejected", "all"];
const programLabel: Record<string, string> = { tahfiz: "Tahfiz", maahad: "Ma'ahad", barnamaj: "Barnamaj" };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const status = statuses.includes(sp.status ?? "") ? sp.status! : "new";
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select("id, full_name, program, guardian_name, guardian_phone, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") query = query.eq("status", status);
  const [{ data: apps }, { count: newCount }] = await Promise.all([
    query,
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">{newCount ?? 0} new</p>

      <nav className="mt-3 flex flex-wrap gap-2 text-sm">
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/portal/applications?status=${s}`}
            className={`rounded-full border px-3 py-1 capitalize ${s === status ? "bg-primary text-primary-foreground" : ""}`}
          >
            {s}
          </Link>
        ))}
      </nav>

      <ul className="mt-4 divide-y rounded-lg border">
        {(apps ?? []).map((a) => (
          <li key={a.id}>
            <Link href={`/portal/applications/${a.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-muted">
              <div className="min-w-0">
                <p className="truncate font-medium">{a.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {programLabel[a.program] ?? a.program} · {a.guardian_name} · {a.guardian_phone}
                </p>
              </div>
              <div className="shrink-0 text-end text-xs text-muted-foreground">
                <p>{new Date(a.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}</p>
                {a.status !== "new" && <p className="capitalize">{a.status}</p>}
              </div>
            </Link>
          </li>
        ))}
        {!apps?.length && <li className="p-4 text-sm text-muted-foreground">No {status === "all" ? "" : status} applications.</li>}
      </ul>
    </div>
  );
}
