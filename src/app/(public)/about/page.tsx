import type { Metadata } from "next";
import { about } from "@/content/about";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">About us</h1>
      <p className="mt-4 text-muted-foreground">{about.intro}</p>
      {about.sections.map((s) => (
        <div key={s.title} className="mt-8">
          <h2 className="text-xl font-semibold">{s.title}</h2>
          <p className="mt-2 text-muted-foreground">{s.text}</p>
        </div>
      ))}
    </section>
  );
}
