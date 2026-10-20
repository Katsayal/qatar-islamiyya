import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { PageHeader } from "@/components/page-header";
import { about } from "@/content/about";

import { toLang } from "@/lib/lang";

export const metadata: Metadata = { title: "About us" };

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  return (
    <>
      <PageHeader label="Who we are" title="About us" text={about.intro} />

      <div className="mx-auto grid max-w-5xl gap-4 px-4 pt-8 pb-2 md:grid-cols-2">
        {about.sections.map((s) => (
          <section key={s.title} className="rounded-xl border border-t-4 border-t-gold bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-muted-foreground">{s.text}</p>
          </section>
        ))}
      </div>

      <CtaBand lang={lang} />
    </>
  );
}
