import type { Metadata } from "next";
import { Suspense } from "react";
import { BankDetails } from "@/components/bank-details";
import { admissionRulesHa, fees, schedule } from "@/content/admissions";
import { ApplicationForm } from "./application-form";

export const metadata: Metadata = { title: "Admissions" };

export default function AdmissionsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Admissions</h1>
      <p className="mt-3 text-muted-foreground">
        Apply online below, or{" "}
        <a href="/admission-form.pdf" download className="text-primary underline-offset-4 hover:underline">
          download the paper form (PDF)
        </a>{" "}
        and bring it to the school.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Fees</h2>
          <dl className="mt-2 grid grid-cols-[1fr_auto] gap-y-1 text-sm">
            {fees.map((f) => (
              <div key={f.label} className="contents">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="font-medium">{f.amount}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-sm text-muted-foreground">
            Pay at the school or to the account below before the student starts. You can send your
            application first: the school confirms payment before admission.
          </p>
          <h3 className="mt-4 font-semibold">Pay to</h3>
          <Suspense fallback={<p className="mt-2 text-sm text-muted-foreground">Loading…</p>}>
            <BankDetails />
          </Suspense>
        </div>
        <div>
          <h2 className="text-xl font-semibold">School days</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {schedule.map((s) => (
              <li key={s.days}>
                <span className="text-muted-foreground">{s.days}:</span> {s.time}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Dokokin shiga tsarin karatu</h2>
      <ol lang="ha" className="mt-2 list-decimal space-y-1 ps-5 text-sm">
        {admissionRulesHa.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>

      <h2 id="apply" className="mt-10 scroll-mt-20 text-2xl font-semibold">
        Apply online
      </h2>
      <div className="mt-4">
        <ApplicationForm />
      </div>
    </section>
  );
}
