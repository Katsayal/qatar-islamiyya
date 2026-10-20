import Image from "next/image";
import Link from "next/link";
import { href, type Lang } from "@/lib/lang";
import { SectionHeading } from "@/components/section-heading";
import { programs } from "@/content/home";

export function HomePrograms({ lang }: { lang: Lang }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-14">
      <SectionHeading label="What we teach" title="Our programs" />
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {programs.map((p) => (
          <li
            key={p.slug}
            className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary to-deep text-white shadow-sm"
          >
            <div className="pattern-star absolute inset-0" />
            {p.image && (
              <>
                <Image src={p.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-deep/75" />
              </>
            )}
            <div className="relative flex h-full flex-col p-6">
              <p lang="ar" dir="rtl" className="font-arabic text-4xl text-gold">
                {p.nameAr}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 flex-1 text-sm text-white/80">{p.text}</p>
              <Link
                href={href(lang, `/programs#${p.slug}`)}
                className="mt-5 inline-block text-sm font-medium text-gold hover:underline"
              >
                Learn more →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
