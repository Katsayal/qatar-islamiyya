import Link from "next/link";
import { href, type Lang } from "@/lib/lang";
import { SectionHeading } from "@/components/section-heading";

export function HomeDonate({ lang }: { lang: Lang }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14">
      <div className="flex flex-col items-start gap-5 rounded-xl border border-gold/50 bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <SectionHeading label="Support the school" title="Help us teach the Qur'an" />
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Participate in this act of Ibadah by giving Sadaqatul Jariyah.
          </p>
        </div>
        <Link
          href={href(lang, "/donate")}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-gold px-7 font-semibold text-deep hover:bg-gold/90"
        >
          Donate
        </Link>
      </div>
    </section>
  );
}
