import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { PageHeader } from "@/components/page-header";
import { programDetails } from "@/content/programs";
import { ui } from "@/content/ui";
import { href, toLang } from "@/lib/lang";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = toLang((await params).lang);
  return pageMeta(lang, "/programs", ui[lang].meta.programs);
}

export default async function ProgramsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  const t = ui[lang];
  const programs = programDetails[lang];
  return (
    <>
      <PageHeader label={t.programsPage.label} title={t.ourPrograms} text={t.programsPage.text}>
        <Link
          href={href(lang, "/admissions")}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-gold px-7 font-semibold text-deep hover:bg-gold/90"
        >
          {t.applyNow}
        </Link>
        {/* Jump links: handy on a phone */}
        <nav className="mt-5 flex flex-wrap gap-2">
          {programs.map((p) => (
            <a
              key={p.slug}
              href={`#${p.slug}`}
              className="rounded-full border border-white/30 px-4 py-1.5 text-sm hover:bg-white/10"
            >
              {p.name}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 pt-8 pb-12">
        {programs.map((p) => (
          <article
            key={p.slug}
            id={p.slug}
            className="scroll-mt-24 overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <div className="relative bg-linear-to-br from-primary to-deep p-6 text-white">
              <div className="pattern-star absolute inset-0" />
              <div className="relative">
                <p lang="ar" dir="rtl" className="font-arabic text-4xl text-gold">
                  {p.nameAr}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{p.name}</h2>
                <p className="mt-1 text-white/80">{p.intro}</p>
              </div>
            </div>
            <div className="p-6">
              <ul className="grid gap-3 text-sm">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary"
                    >
                      ✓
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={href(lang, "/admissions")}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-gold px-7 font-semibold text-deep hover:bg-gold/90 sm:w-auto"
              >
                {t.programsPage.applyFor} {p.name}
              </Link>
            </div>
          </article>
        ))}
      </div>

      <CtaBand lang={lang} />
    </>
  );
}
