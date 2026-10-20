import Image from "next/image";
import Link from "next/link";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { href, type Lang } from "@/lib/lang";

export function HomeHero({ lang }: { lang: Lang }) {
  const t = ui[lang];
  return (
    <>
      <section className="pattern-star bg-deep text-white">
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 text-center md:pb-28 md:pt-16">
          <Image src="/logo.svg" alt="" width={104} height={104} loading="eager" className="mx-auto size-24 md:size-28" />
          <p lang="ar" dir="rtl" className="font-arabic mt-5 text-xl text-gold">
            بسم الله الرحمن الرحيم
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">Madrasatu Hajiya Hindatu</h1>
          <p className="mx-auto mt-1 max-w-xl text-white/80">{t.hero.tagline}</p>
          <p className="mx-auto mt-1 max-w-xl text-white/80">{t.hero.place}</p>
          <p lang="ar" dir="rtl" className="font-arabic mt-5 text-xl text-white/80">
            مدرسة الحاجة هندة (قطر دورا)
          </p>
          <p lang="ar" dir="rtl" className="font-quran mt-6 text-3xl text-gold">
            ٱقۡرَأۡ بِٱسۡمِ رَبِّكَ ٱلَّذِي خَلَقَ
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={href(lang, "/admissions")}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-gold px-7 font-semibold text-deep hover:bg-gold/90"
            >
              {t.applyNow}
            </Link>
            <Link
              href={href(lang, "/programs")}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-7 font-medium text-white hover:bg-white/10"
            >
              {t.ourPrograms}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick facts: overlaps the bottom edge of the hero */}
      <div className="mx-auto -mt-10 max-w-5xl px-4">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border shadow-md md:grid-cols-4">
          {home[lang].facts.map((f) => (
            <li key={f.label} className="bg-card p-4 text-center">
              <p className="text-2xl font-semibold text-primary">{f.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
