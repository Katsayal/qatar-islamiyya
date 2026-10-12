import { Download, FileText, Lock, Pencil, Plus, Users } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { btn } from "@/components/buttons";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

type Row = { id: string; title: string; category: string | null; created_at: string };

function DocumentList({
  title,
  icon,
  rows,
  staff,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Row[];
  staff: boolean;
}) {
  return (
    <section className="mt-6 rounded-xl border bg-card shadow-sm">
      <h2 className="flex items-center gap-2 border-b p-3 font-semibold [&_svg]:size-4 [&_svg]:text-primary">
        {icon} {title} <span className="text-sm font-normal text-muted-foreground">({rows.length})</span>
      </h2>
      {rows.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">No documents yet.</p>
      ) : (
        <ul className="divide-y">
          {rows.map((d) => (
            <li key={d.id} className="flex items-center gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.category ? `${d.category} · ` : ""}
                  {new Date(d.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
              </div>
              <a href={`/portal/documents/${d.id}/download`} className={`${btn.secondary} h-10 px-3`} aria-label={`Download ${d.title}`}>
                <Download aria-hidden /> <span className="hidden sm:inline">Download</span>
              </a>
              {staff && (
                <Link href={`/portal/documents/${d.id}/edit`} className={`${btn.secondary} h-10 px-3`} aria-label={`Edit ${d.title}`}>
                  <Pencil aria-hidden /> <span className="hidden sm:inline">Edit</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function DocumentsPage() {
  const profile = await requireRole("teacher", "staff");
  const staff = profile.role === "staff";
  const supabase = await createClient();
  // RLS: teachers only get `general` and `students` rows; staff also get `vault`.
  const { data } = await supabase
    .from("documents")
    .select("id, title, category, visibility, created_at")
    .in("visibility", ["general", "students", "vault"])
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold gold-bar">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Files the school shares: timetables, notes, forms.</p>
        </div>
        {staff && (
          <Link href="/portal/documents/new" className={btn.create}>
            <Plus aria-hidden /> Add document
          </Link>
        )}
      </div>

      <DocumentList
        title={staff ? "General (teachers & staff)" : "Shared by the school"}
        icon={<FileText aria-hidden />}
        rows={rows.filter((d) => d.visibility === "general")}
        staff={staff}
      />
      <DocumentList title="Shared with students" icon={<Users aria-hidden />} rows={rows.filter((d) => d.visibility === "students")} staff={staff} />
      {staff && (
        <DocumentList title="Vault (staff only)" icon={<Lock aria-hidden />} rows={rows.filter((d) => d.visibility === "vault")} staff={staff} />
      )}
    </div>
  );
}
