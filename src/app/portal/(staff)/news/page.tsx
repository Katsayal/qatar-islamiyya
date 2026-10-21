import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DualDate } from "@/components/dual-date";
import { getHijriOffsets } from "@/lib/hijri-offsets";
import { lagosDate } from "@/lib/today";

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

  const hijri = await getHijriOffsets();
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
                <div className="flex flex-wrap items-end gap-1 text-xs text-muted-foreground">
                  <DualDate iso={lagosDate(p.published_at!)} offsets={hijri} style="medium" className="font-medium text-foreground" />
                  {p.audience === "internal" && " · Teachers & staff"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
