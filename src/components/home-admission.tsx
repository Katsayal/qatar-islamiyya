import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { fees, schedule } from "@/content/admissions";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { href, type Lang } from "@/lib/lang";

export function HomeAdmission({ lang }: { lang: Lang }) {
  const t = ui[lang];
  return (
    <section className="mx-auto max-w-5xl px-4 pt-14">
      <SectionHeading label={t.home.joiningLabel} title={t.home.joiningTitle} />
      <ol className="mt-6 grid gap-4 md:grid-cols-4">
        {home[lang].admissionSteps.map((s, i) => (
          <li key={s.title} className="rounded-xl border bg-card p-5 shadow-sm">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <h3 className="mt-3 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-secondary p-5">
          <h3 className="font-semibold text-secondary-foreground">{t.home.schoolDays}</h3>
          <ul className="mt-3 grid gap-2 text-sm">
            {schedule[lang].map((d) => (
              <li key={d.days} className="flex justify-between gap-3">
                <span>{d.days}</span>
                <span className="text-muted-foreground">{d.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-secondary p-5">
          <h3 className="font-semibold text-secondary-foreground">{t.home.fees}</h3>
          <ul className="mt-3 grid gap-2 text-sm">
            {fees[lang].map((f) => (
              <li key={f.label} className="flex justify-between gap-3">
                <span>{f.label}</span>
                <span className="font-medium">{f.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link href={href(lang, "/admissions")} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        {t.home.fullRules}
      </Link>
    </section>
  );
}
