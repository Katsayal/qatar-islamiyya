import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
          priority
          className="aspect-video w-full rounded-lg object-cover"
        />
      )}
      <h1 className="mt-4 text-3xl font-semibold">{post.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {new Date(post.published_at!).toLocaleDateString("en-GB", { dateStyle: "long" })}
      </p>
      <PostBody body={post.body} lang={post.lang} />
    </article>
  );
}

export default function PostPage({ params }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/news" className="text-sm text-primary underline-offset-4 hover:underline">
        ← All news
      </Link>
      <div className="mt-4">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <Post params={params} />
        </Suspense>
      </div>
    </section>
  );
}
