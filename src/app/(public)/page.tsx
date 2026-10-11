import Link from "next/link";
import { Suspense } from "react";
import { HomeAdmission } from "@/components/home-admission";
import { HomeCta } from "@/components/home-cta";
import { HomeDonate } from "@/components/home-donate";
import { HomeHero } from "@/components/home-hero";
import { HomePrograms } from "@/components/home-programs";
import { LatestNews } from "@/components/latest-news";
import { CardsSkeleton } from "@/components/page-skeleton";
import { SectionHeading } from "@/components/section-heading";

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomePrograms />
      <HomeAdmission />

      <section className="mx-auto max-w-5xl px-4 pt-14">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading label="What's happening" title="Latest news" />
          <Link href="/news" className="shrink-0 text-sm font-medium text-primary hover:underline">
            All news →
          </Link>
        </div>
        <Suspense fallback={<div className="mt-6"><CardsSkeleton count={3} grid="md:grid-cols-3" image /></div>}>
          <LatestNews />
        </Suspense>
      </section>

      <HomeCta />
      <HomeDonate />
    </>
  );
}
