import Link from "next/link";
import { PortalTitle } from "@/components/portal-title";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StudentNewsPage() {
  await requireRole("student");
  const supabase = await createClient();
  // RLS: a student only gets published posts for the public or for students.
  const { data } = await supabase
    .from("posts")
    .select("id, title, audience, published_at")
    .in("audience", ["public", "students"])
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);
  const posts = data ?? [];

  return (
    <div className="max-w-xl">
      <PortalTitle title="News" />
      {posts.length === 0 ? (
        <p className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No news yet.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-xl border bg-card shadow-sm">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/portal/student/news/${p.id}`} className="block p-4 hover:bg-secondary">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(p.published_at!).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  {p.audience === "students" && " · For students"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
