import type { Metadata } from "next";
import Link from "next/link";
import { CurriculumTable } from "@/components/curriculum-table";
import { buttonVariants } from "@/components/ui/button";
import { programDetails } from "@/content/programs";

export const metadata: Metadata = { title: "Our programs" };

export default function ProgramsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Our programs</h1>

      {programDetails.map((p) => (
        <div key={p.slug} id={p.slug} className="mt-10 scroll-mt-20">
          <p lang="ar" dir="rtl" className="font-arabic text-2xl text-primary">
            {p.nameAr}
          </p>
          <h2 className="text-2xl font-semibold">{p.name}</h2>
          <p className="mt-2 text-muted-foreground">{p.intro}</p>
          <ul className="mt-3 list-disc space-y-1 ps-5 text-sm">
            {p.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
          {p.slug === "barnamaj" && (
            <>
              <h3 className="mt-6 text-lg font-semibold">Curriculum</h3>
              <CurriculumTable />
            </>
          )}
        </div>
      ))}

      <Link href="/admissions" className={buttonVariants({ size: "lg" }) + " mt-10 h-11 px-6"}>
        Apply now
      </Link>
    </section>
  );
}
