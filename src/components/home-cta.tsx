import Link from "next/link";
import { school } from "@/content/school";

export function HomeCta() {
  return (
    <section className="pattern-star mt-14 bg-deep text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold md:text-3xl">Ready to join us?</h2>
        <p className="mx-auto mt-2 max-w-md text-white/80">
          Apply online, or speak to us first. We are happy to answer your questions.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admissions"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-gold px-7 font-semibold text-deep hover:bg-gold/90"
          >
            Apply now
          </Link>
          <a
            href={school.whatsapp}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-7 font-medium hover:bg-white/10"
          >
            Chat on WhatsApp
          </a>
          <a
            href={`tel:${school.phones[0]}`}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-7 font-medium hover:bg-white/10"
          >
            Call {school.phones[0]}
          </a>
        </div>
      </div>
    </section>
  );
}
