import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const audienceLabel = { public: "Public", internal: "Teachers & staff", students: "Students" } as const;

export default async function PostsPage() {
  await requireRole("staff");
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, audience, published_at, created_at")
    .order("created_at", { ascending: false });
  const posts = data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">News posts</h1>
        <Link href="/portal/posts/new" className="flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Add post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-4 rounded-lg border p-4 text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {audienceLabel[p.audience as keyof typeof audienceLabel]} ·{" "}
                  {p.published_at
                    ? `Published ${new Date(p.published_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}`
                    : "Draft"}
                </p>
              </div>
              <Link href={`/portal/posts/${p.id}/edit`} className="flex h-10 shrink-0 items-center rounded-md border px-3 text-sm hover:bg-muted">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
