import Link from "next/link";
import { Suspense } from "react";
import { HomeAdmission } from "@/components/home-admission";
import { CtaBand } from "@/components/cta-band";
import { HomeDonate } from "@/components/home-donate";
import { HomeHero } from "@/components/home-hero";
import { HomePrograms } from "@/components/home-programs";
import { LatestNews } from "@/components/latest-news";
import { CardsSkeleton } from "@/components/page-skeleton";
import { SectionHeading } from "@/components/section-heading";
import { ui } from "@/content/ui";
import type { Metadata } from "next";
import { href, toLang } from "@/lib/lang";
import { pageMeta } from "@/lib/page-meta";

// Title and description come from the [lang] layout; the page adds its two language versions.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta(toLang((await params).lang), "/");
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  const t = ui[lang].home;
  return (
    <>
      <HomeHero lang={lang} />
      <HomePrograms lang={lang} />
      <HomeAdmission lang={lang} />

      <section className="mx-auto max-w-5xl px-4 pt-14">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading label={t.newsLabel} title={t.newsTitle} />
          <Link href={href(lang, "/news")} className="shrink-0 text-sm font-medium text-primary hover:underline">
            {t.allNews}
          </Link>
        </div>
        <Suspense fallback={<div className="mt-6"><CardsSkeleton count={3} grid="md:grid-cols-3" image label={ui[lang].loading} /></div>}>
          <LatestNews lang={lang} />
        </Suspense>
      </section>

      <CtaBand lang={lang} />
      <HomeDonate lang={lang} />
    </>
  );
}
