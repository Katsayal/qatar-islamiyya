import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

type Row = { id: string; title: string; category: string | null; created_at: string };

function DocumentList({ rows, staff }: { rows: Row[]; staff: boolean }) {
  if (rows.length === 0) return <p className="mt-2 rounded-lg border p-4 text-sm text-muted-foreground">No documents yet.</p>;
  return (
    <ul className="mt-2 divide-y rounded-lg border">
      {rows.map((d) => (
        <li key={d.id} className="flex items-center gap-2 p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{d.title}</p>
            <p className="text-xs text-muted-foreground">
              {d.category ? `${d.category} · ` : ""}
              {new Date(d.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
            </p>
          </div>
          <a href={`/portal/documents/${d.id}/download`} className="flex h-10 shrink-0 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted">
            Download
          </a>
          {staff && (
            <Link href={`/portal/documents/${d.id}/edit`} className="flex h-10 shrink-0 items-center rounded-md border px-3 text-sm hover:bg-muted">
              Edit
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function DocumentsPage() {
  const profile = await requireRole("teacher", "staff");
  const staff = profile.role === "staff";
  const supabase = await createClient();
  // RLS: teachers only get `general` rows; staff also get `vault`.
  const { data } = await supabase
    .from("documents")
    .select("id, title, category, visibility, created_at")
    .in("visibility", ["general", "students", "vault"])
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Documents</h1>
        {staff && (
          <Link href="/portal/documents/new" className="flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Add document
          </Link>
        )}
      </div>

      <h2 className="mt-6 font-medium">{staff ? "General (teachers & staff)" : "Shared by the school"}</h2>
      <DocumentList rows={rows.filter((d) => d.visibility === "general")} staff={staff} />

      <h2 className="mt-6 font-medium">Shared with students</h2>
      <DocumentList rows={rows.filter((d) => d.visibility === "students")} staff={staff} />

      {staff && (
        <>
          <h2 className="mt-6 font-medium">Vault (staff only)</h2>
          <DocumentList rows={rows.filter((d) => d.visibility === "vault")} staff={staff} />
        </>
      )}
    </div>
  );
}
