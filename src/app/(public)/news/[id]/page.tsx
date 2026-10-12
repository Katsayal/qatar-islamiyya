import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/page-skeleton";
import { PostBody } from "@/components/post-body";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

async function getPost(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, body, lang, cover_path, published_at")
    .eq("id", id)
    .eq("audience", "public")
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).id);
  if (!post) return { title: "News" };
  return { title: post.title, description: post.body.slice(0, 150) };
}

async function Post({ params }: Props) {
  const post = await getPost((await params).id);
  if (!post) notFound();

  return (
    <article>
      {post.cover_path && (
        <Image
          src={siteImageUrl(post.cover_path)}
          alt=""
          width={960}
          height={540}
          sizes="(min-width: 768px) 736px, 100vw"
          loading="eager"
          fetchPriority="high"
          className="aspect-video w-full rounded-xl object-cover shadow-sm"
        />
      )}
      <h1 className="mt-5 text-3xl font-semibold">{post.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {new Date(post.published_at!).toLocaleDateString("en-GB", { dateStyle: "long" })}
      </p>
      <PostBody body={post.body} lang={post.lang} />
    </article>
  );
}

export default function PostPage({ params }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-8 pb-12">
      <Link
        href="/news"
        className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-medium text-primary hover:border-primary"
      >
        ← All news
      </Link>
      <div className="mt-4">
        <Suspense fallback={<ArticleSkeleton />}>
          <Post params={params} />
        </Suspense>
      </div>
    </section>
  );
}
