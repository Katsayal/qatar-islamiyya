import { createClient } from "@/lib/supabase/server";

export async function LatestNews() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, published_at")
    .eq("audience", "public")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(3);

  if (!posts?.length) {
    return <p className="mt-4 text-sm text-muted-foreground">No news yet. Please check back soon.</p>;
  }

  return (
    <ul className="mt-4 grid gap-3 md:grid-cols-3">
      {posts.map((p) => (
        <li key={p.id} className="rounded-lg border p-4">
          <p className="font-medium">{p.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(p.published_at!).toLocaleDateString("en-GB", { dateStyle: "medium" })}
          </p>
        </li>
      ))}
    </ul>
  );
}
