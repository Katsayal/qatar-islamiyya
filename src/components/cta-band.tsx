import Link from "next/link";
import { school } from "@/content/school";
import { ui } from "@/content/ui";
import { href, type Lang } from "@/lib/lang";

export function CtaBand({ lang }: { lang: Lang }) {
  const t = ui[lang];
  return (
    <section className="pattern-star mt-14 bg-deep text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">{t.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-white/80">{t.cta.text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={href(lang, "/admissions")}
            className="inline-flex h-14 items-center justify-center rounded-lg bg-gold px-9 text-lg font-semibold text-deep hover:bg-gold/90"
          >
            {t.applyNow}
          </Link>
          <a
            href={school.whatsapp}
            className="inline-flex h-14 items-center justify-center rounded-lg border border-white/40 px-7 font-medium hover:bg-white/10"
          >
            {t.whatsapp}
          </a>
          <a
            href={`tel:${school.phones[0]}`}
            className="inline-flex h-14 items-center justify-center rounded-lg border border-white/40 px-7 font-medium hover:bg-white/10"
          >
            {t.call} {school.phones[0]}
          </a>
        </div>
      </div>
    </section>
  );
}
