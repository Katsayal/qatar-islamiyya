import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { btn } from "@/components/buttons";
import { StatusBadge } from "@/components/status-badge";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const audienceLabel = { public: "Public website", internal: "Teachers & staff", students: "Students" } as const;

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold gold-bar">News posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">News for the website, for teachers and staff, or for students.</p>
        </div>
        <Link href="/portal/posts/new" className={btn.create}>
          <Plus aria-hidden /> Add post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground shadow-sm">No posts yet.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-xl border bg-card shadow-sm">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {p.published_at ? (
                    <StatusBadge tone="good">Published</StatusBadge>
                  ) : (
                    <StatusBadge tone="warn">Draft</StatusBadge>
                  )}
                  <StatusBadge tone="muted">{audienceLabel[p.audience as keyof typeof audienceLabel]}</StatusBadge>
                  {p.published_at && (
                    <span>{new Date(p.published_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}</span>
                  )}
                </div>
              </div>
              <Link href={`/portal/posts/${p.id}/edit`} className={`${btn.secondary} h-10 px-3`} aria-label={`Edit ${p.title}`}>
                <Pencil aria-hidden /> Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
