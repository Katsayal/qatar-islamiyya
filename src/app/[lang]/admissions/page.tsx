import type { Metadata } from "next";
import { Suspense } from "react";
import { BankDetails } from "@/components/bank-details";
import { LinesSkeleton } from "@/components/page-skeleton";
import { PageHeader } from "@/components/page-header";
import { admissionRules, fees, schedule } from "@/content/admissions";
import { ui } from "@/content/ui";
import { toLang } from "@/lib/lang";
import { pageMeta } from "@/lib/page-meta";
import { ApplicationForm } from "./application-form";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  return pageMeta(lang, "/admissions", ui[lang].meta.admissions);
}

export default async function AdmissionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  const t = ui[lang].admissionsPage;
  return (
    <>
      <PageHeader label={t.label} title={t.title} text={t.text}>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="#apply"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-gold px-7 font-semibold text-deep hover:bg-gold/90"
          >
            {t.applyOnline}
          </a>
          <a
            href="/admission-form.pdf"
            download
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-7 font-medium hover:bg-white/10"
          >
            {t.downloadForm}
          </a>
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-3xl gap-8 px-4 pt-8 pb-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">{t.fees}</h2>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
              {fees[lang].map((f) => (
                <div key={f.label} className="contents">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="font-semibold">{f.amount}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">{t.feesNote}</p>
            <h3 className="mt-4 font-semibold">{t.payTo}</h3>
            <Suspense fallback={<div className="mt-2"><LinesSkeleton label={ui[lang].loading} /></div>}>
              <BankDetails lang={lang} />
            </Suspense>
          </div>
          <div className="self-start rounded-xl border bg-secondary p-5">
            <h2 className="text-xl font-semibold text-secondary-foreground">{t.schoolDays}</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {schedule[lang].map((s) => (
                <li key={s.days} className="flex justify-between gap-3">
                  <span>{s.days}</span>
                  <span className="text-muted-foreground">{s.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-semibold">{t.rules}</h2>
          <ol className="mt-4 grid gap-3 text-sm">
            {admissionRules[lang].map((r, i) => (
              <li key={r} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>

        <div id="apply" className="scroll-mt-24 rounded-xl border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-2xl font-semibold">{t.applyTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.applyNote}</p>
          <div className="mt-6">
            <ApplicationForm t={ui[lang].applyForm} />
          </div>
        </div>
      </div>
    </>
  );
}
