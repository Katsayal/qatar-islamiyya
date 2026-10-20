import type { Metadata } from "next";
import { Suspense } from "react";
import { BankDetails } from "@/components/bank-details";
import { LinesSkeleton } from "@/components/page-skeleton";
import { SectionHeading } from "@/components/section-heading";
import { school } from "@/content/school";
import { ui } from "@/content/ui";
import { toLang } from "@/lib/lang";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  return pageMeta(lang, "/donate", ui[lang].meta.donate);
}

export default async function DonatePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  const t = ui[lang];
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <SectionHeading label={t.donatePage.label} title={t.donatePage.title} />
      <p className="mt-4 text-muted-foreground">{t.donatePage.intro}</p>

      <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">{t.donatePage.bankTitle}</h2>
        <Suspense fallback={<div className="mt-2"><LinesSkeleton label={t.loading} /></div>}>
          <BankDetails lang={lang} />
        </Suspense>
      </div>

      <div className="mt-4 rounded-xl border bg-secondary p-5">
        <h2 className="font-semibold text-secondary-foreground">{t.donatePage.tellTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.donatePage.tellText}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href={school.whatsapp}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t.whatsapp}
          </a>
          <a
            href={`tel:${school.phones[0]}`}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-primary/40 px-6 font-medium text-primary hover:bg-card"
          >
            {t.call} {school.phones[0]}
          </a>
        </div>
      </div>
    </section>
  );
}
