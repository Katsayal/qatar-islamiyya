import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleSkeleton } from "@/components/page-skeleton";
import { PostBody } from "@/components/post-body";
import { PostLangLabel } from "@/components/post-lang-label";
import { ui } from "@/content/ui";
import { href, toLang } from "@/lib/lang";
import { pageMeta } from "@/lib/page-meta";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { DualDate } from "@/components/dual-date";
import { getHijriOffsets } from "@/lib/hijri-offsets";
import { lagosDate } from "@/lib/today";

type Props = { params: Promise<{ lang: string; id: string }> };

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
  const { lang: l, id } = await params;
  const lang = toLang(l);
  const post = await getPost(id);
  if (!post) return { title: ui[lang].meta.news };
  const meta = pageMeta(lang, `/news/${id}`, post.title);
  // The cover photo is the link preview; without one the site-wide image from pageMeta stays.
  const cover = post.cover_path ? siteImageUrl(post.cover_path) : null;
  const openGraph = { ...meta.openGraph, type: "article" as const, ...(cover ? { images: [cover] } : {}) };
  const twitter = { ...meta.twitter, ...(cover ? { images: [cover] } : {}) };
  return { ...meta, openGraph, twitter, description: post.body.slice(0, 150) };
}

async function Post({ params }: Props) {
  const { lang: l, id } = await params;
  const lang = toLang(l);
  const post = await getPost(id);
  if (!post) notFound();

  const hijri = await getHijriOffsets();
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
      {/* The post keeps its own language and direction, also on the other language's page. */}
      <h1 lang={post.lang} dir={post.lang === "ar" ? "rtl" : "ltr"} className="mt-5 text-3xl font-semibold">
        {post.title}
      </h1>
      <div className="mt-1 flex flex-wrap items-end gap-1 text-sm text-muted-foreground">
        <DualDate iso={lagosDate(post.published_at!)} offsets={hijri} lang={lang} className="font-medium text-foreground" />
        <PostLangLabel postLang={post.lang} lang={lang} />
      </div>
      <PostBody body={post.body} lang={post.lang} />
    </article>
  );
}

const backClass = "inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-medium text-primary hover:border-primary";

// Reads params, so it streams in (the article id is not known at build time). The placeholder is an empty
// pill of the same size: the prerendered shell does not know the page language, so it shows no word.
async function BackLink({ params }: Props) {
  const lang = toLang((await params).lang);
  return (
    <Link href={href(lang, "/news")} className={backClass}>
      {ui[lang].newsPage.back}
    </Link>
  );
}

export default function PostPage({ params }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-8 pb-12">
      <Suspense fallback={<span aria-hidden className={`${backClass} w-28`} />}>
        <BackLink params={params} />
      </Suspense>
      <div className="mt-4">
        <Suspense fallback={<ArticleSkeleton />}>
          <Post params={params} />
        </Suspense>
      </div>
    </section>
  );
}
