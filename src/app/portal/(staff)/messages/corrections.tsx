import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { setCorrectionDone } from "./actions";

const filters = ["open", "done", "all"];

// Student correction requests (staff only; the page already checked the role).
export async function Corrections({ show: showParam }: { show?: string }) {
  const show = filters.includes(showParam ?? "") ? showParam! : "open";
  const supabase = await createClient();

  let query = supabase
    .from("correction_requests")
    .select("id, message, status, created_at, students(id, full_name, admission_no)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (show !== "all") query = query.eq("status", show);
  const { data: requests } = await query;

  return (
    <>
      <nav className="mt-3 flex flex-wrap gap-2 text-sm">
        {filters.map((f) => (
          <Link
            key={f}
            href={`/portal/messages?kind=corrections&show=${f}`}
            className={`rounded-full border px-3 py-1 capitalize ${f === show ? "bg-primary text-primary-foreground" : ""}`}
          >
            {f}
          </Link>
        ))}
      </nav>

      <ul className="mt-4 space-y-3">
        {(requests ?? []).map((r) => (
          <li key={r.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {r.students ? (
                  <Link href={`/portal/students/${r.students.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                    {r.students.full_name}
                  </Link>
                ) : (
                  <p className="font-medium">Unknown student</p>
                )}
                <p className="text-sm text-muted-foreground">{r.students?.admission_no}</p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
              </p>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm">{r.message}</p>
            <form action={setCorrectionDone.bind(null, r.id, r.status !== "done")} className="mt-3">
              <button className="h-10 rounded-md border px-4 text-sm hover:bg-muted">
                {r.status === "done" ? "Reopen" : "Mark done"}
              </button>
            </form>
          </li>
        ))}
        {!requests?.length && <li className="text-sm text-muted-foreground">No requests here.</li>}
      </ul>
    </>
  );
}
