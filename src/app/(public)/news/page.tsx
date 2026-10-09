import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "News & events" };

async function NewsList() {
  const supabase = await createClient();
  // RLS hides drafts and future-dated posts; audience filter keeps staff from seeing internal posts here.
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, body, cover_path, published_at")
    .eq("audience", "public")
    .order("published_at", { ascending: false });

  if (!posts?.length) {
    return <p className="mt-6 text-muted-foreground">No news yet. Please check back soon.</p>;
  }

  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-2">
      {posts.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-lg border">
          {p.cover_path && (
            <Image
              src={siteImageUrl(p.cover_path)}
              alt=""
              width={640}
              height={360}
              className="aspect-video w-full object-cover"
            />
          )}
          <div className="p-4">
            <Link href={`/news/${p.id}`} className="font-semibold hover:text-primary">
              {p.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(p.published_at!).toLocaleDateString("en-GB", { dateStyle: "medium" })}
            </p>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function NewsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">News &amp; events</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-muted-foreground">Loading…</p>}>
        <NewsList />
      </Suspense>
    </section>
  );
}
