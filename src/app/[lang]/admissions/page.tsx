import type { Metadata } from "next";
import { Suspense } from "react";
import { BankDetails } from "@/components/bank-details";
import { LinesSkeleton } from "@/components/page-skeleton";
import { PageHeader } from "@/components/page-header";
import { admissionRules, fees, schedule } from "@/content/admissions";
import { ApplicationForm } from "./application-form";

export const metadata: Metadata = { title: "Admissions" };

export default function AdmissionsPage() {
  return (
    <>
      <PageHeader
        label="Join us"
        title="Admissions"
        text="Apply online below, or download the paper form and bring it to the school."
      >
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="#apply"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-gold px-7 font-semibold text-deep hover:bg-gold/90"
          >
            Apply online
          </a>
          <a
            href="/admission-form.pdf"
            download
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-7 font-medium hover:bg-white/10"
          >
            Download the paper form (PDF)
          </a>
        </div>
      </PageHeader>

      <div className="mx-auto grid max-w-3xl gap-8 px-4 pt-8 pb-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Fees</h2>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
              {fees.map((f) => (
                <div key={f.label} className="contents">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="font-semibold">{f.amount}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              Pay at the school or to the account below before the student starts. You can send your
              application first: the school confirms payment before admission.
            </p>
            <h3 className="mt-4 font-semibold">Pay to</h3>
            <Suspense fallback={<div className="mt-2"><LinesSkeleton /></div>}>
              <BankDetails />
            </Suspense>
          </div>
          <div className="self-start rounded-xl border bg-secondary p-5">
            <h2 className="text-xl font-semibold text-secondary-foreground">School days</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {schedule.map((s) => (
                <li key={s.days} className="flex justify-between gap-3">
                  <span>{s.days}</span>
                  <span className="text-muted-foreground">{s.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-xl font-semibold">Admission rules</h2>
          <ol className="mt-4 grid gap-3 text-sm">
            {admissionRules.map((r, i) => (
              <li key={r} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>

        <div id="apply" className="scroll-mt-24 rounded-xl border bg-card p-5 shadow-sm md:p-6">
          <h2 className="text-2xl font-semibold">Apply online</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fields marked * are required. The school will contact the guardian by phone.
          </p>
          <div className="mt-6">
            <ApplicationForm />
          </div>
        </div>
      </div>
    </>
  );
}
