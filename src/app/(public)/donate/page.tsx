import type { Metadata } from "next";
import { Suspense } from "react";
import { BankDetails } from "@/components/bank-details";
import { LinesSkeleton } from "@/components/page-skeleton";
import { SectionHeading } from "@/components/section-heading";
import { school } from "@/content/school";

export const metadata: Metadata = { title: "Donate" };

export default function DonatePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <SectionHeading label="Support the school" title="Donate" />
      <p className="mt-4 text-muted-foreground">
        Your Sadaqatul Jariyah supports the teaching of the Qur&apos;an and Islamic education at {school.name}. May
        Allah reward you.
      </p>

      <div className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Send your donation by bank transfer</h2>
        <Suspense fallback={<div className="mt-2"><LinesSkeleton /></div>}>
          <BankDetails />
        </Suspense>
      </div>

      <div className="mt-4 rounded-xl border bg-secondary p-5">
        <h2 className="font-semibold text-secondary-foreground">Tell us about your gift</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          After you give, you are welcome to send us a message so we can thank you, or call us with any
          question.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href={school.whatsapp}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Chat on WhatsApp
          </a>
          <a
            href={`tel:${school.phones[0]}`}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-primary/40 px-6 font-medium text-primary hover:bg-card"
          >
            Call {school.phones[0]}
          </a>
        </div>
      </div>
    </section>
  );
}
