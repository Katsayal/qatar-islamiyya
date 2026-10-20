import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { CardsSkeleton } from "@/components/page-skeleton";
import { PostLangLabel } from "@/components/post-lang-label";
import { ui } from "@/content/ui";
import { formatDate, href, toLang, type Lang } from "@/lib/lang";
import { pageMeta } from "@/lib/page-meta";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  return pageMeta(lang, "/news", ui[lang].meta.news);
}

// Every public post in both languages; each post keeps its own language and direction (SPEC §7).
async function NewsList({ lang }: { lang: Lang }) {
  const supabase = await createClient();
  // RLS hides drafts and future-dated posts; audience filter keeps staff from seeing internal posts here.
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, body, lang, cover_path, published_at")
    .eq("audience", "public")
    .order("published_at", { ascending: false });

  if (!posts?.length) {
    return <p className="rounded-xl border bg-card p-6 text-muted-foreground">{ui[lang].home.noNews}</p>;
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {posts.map((p, i) => (
        <li key={p.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {p.cover_path && (
            <Image
              src={siteImageUrl(p.cover_path)}
              alt=""
              width={640}
              height={360}
              sizes="(min-width: 768px) 432px, 100vw"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              className="aspect-video w-full object-cover"
            />
          )}
          <div className="p-4">
            <p lang={p.lang} dir={p.lang === "ar" ? "rtl" : "ltr"}>
              <Link href={href(lang, `/news/${p.id}`)} className="font-semibold hover:text-primary">
                {p.title}
              </Link>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(lang, p.published_at!, "medium")}
              <PostLangLabel postLang={p.lang} lang={lang} />
            </p>
            <p lang={p.lang} dir={p.lang === "ar" ? "rtl" : "ltr"} className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {p.body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  const t = ui[lang];
  return (
    <>
      <PageHeader label={t.newsPage.label} title={t.newsPage.title} />
      {/* min-h: when the list is shorter than the skeleton, the footer would jump up into view (layout shift) */}
      <section className="mx-auto min-h-[70vh] max-w-4xl px-4 pt-8 pb-12">
        <Suspense fallback={<CardsSkeleton count={4} grid="md:grid-cols-2" image label={t.loading} />}>
          <NewsList lang={lang} />
        </Suspense>
      </section>
    </>
  );
}
