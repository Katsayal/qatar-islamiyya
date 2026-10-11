import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { LatestNews } from "@/components/latest-news";
import { CardsSkeleton } from "@/components/page-skeleton";
import { programs } from "@/content/home";

export default function Home() {
  return (
    <>
      <section className="bg-muted">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center md:py-20">
          <p lang="ar" dir="rtl" className="font-arabic text-2xl text-primary">
            بسم الله الرحمن الرحيم
          </p>
          <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Madrasatu Hajiya Hindatu</h1>
          <p lang="ar" dir="rtl" className="font-arabic mt-2 text-xl text-muted-foreground">
            مدرسة الحاجة هندة (قطر دورا)
          </p>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Qatar Multi-Purpose Centre, Zango Road, Daura. Memorising the Qur&apos;an and learning
            the basics of Islam, with care and discipline.
          </p>
          <p lang="ar" dir="rtl" className="font-quran mt-6 text-3xl">
            ٱقۡرَأۡ بِٱسۡمِ رَبِّكَ ٱلَّذِي خَلَقَ
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/admissions" className={buttonVariants({ size: "lg" }) + " h-11 px-6"}>
              Apply now
            </Link>
            <Link
              href="/programs"
              className={buttonVariants({ variant: "outline", size: "lg" }) + " h-11 px-6"}
            >
              Our programs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Our programs</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {programs.map((p) => (
            <li key={p.slug} className="rounded-lg border p-4">
              <p lang="ar" dir="rtl" className="font-arabic text-xl text-primary">
                {p.nameAr}
              </p>
              <h3 className="mt-1 font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              <Link
                href={`/programs#${p.slug}`}
                className="mt-3 inline-block text-sm text-primary underline-offset-4 hover:underline"
              >
                Learn more
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Latest news</h2>
          <Link href="/news" className="text-sm text-primary underline-offset-4 hover:underline">
            All news
          </Link>
        </div>
        <Suspense fallback={<div className="mt-4"><CardsSkeleton count={3} grid="md:grid-cols-3" /></div>}>
          <LatestNews />
        </Suspense>
      </section>
    </>
  );
}
