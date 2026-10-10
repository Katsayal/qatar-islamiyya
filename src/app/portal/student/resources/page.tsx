import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StudentResourcesPage() {
  await requireRole("student");
  const supabase = await createClient();

  // RLS: a student only gets documents the school shared with students.
  const { data } = await supabase
    .from("documents")
    .select("id, title, category, created_at")
    .eq("visibility", "students")
    .order("created_at", { ascending: false });
  const docs = data ?? [];

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Resources</h1>
        <p className="text-sm text-muted-foreground">Timetables, notes and other files shared by the school.</p>
      </div>

      <ul className="divide-y rounded-lg border">
        {docs.map((d) => (
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
          </li>
        ))}
        {!docs.length && <li className="p-3 text-sm text-muted-foreground">Nothing has been shared yet.</li>}
      </ul>

      <p className="text-sm text-muted-foreground">
        The school&apos;s curriculum is on the{" "}
        <Link href="/programs" className="text-primary underline-offset-4 hover:underline">Programs page</Link>.
      </p>
    </div>
  );
}
