import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function NewsPage() {
  await requireRole("teacher", "staff");
  const supabase = await createClient();
  // RLS decides what each role may read; drafts have no publish date.
  const { data } = await supabase
    .from("posts")
    .select("id, title, audience, published_at")
    .in("audience", ["public", "internal"])
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);
  const posts = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold gold-bar">News</h1>
      {posts.length === 0 ? (
        <p className="mt-4 rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No news yet.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-xl border bg-card shadow-sm">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/portal/news/${p.id}`} className="block p-3 hover:bg-muted">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(p.published_at!).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  {p.audience === "internal" && " · Teachers & staff"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
