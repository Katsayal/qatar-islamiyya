import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DeleteYear } from "./delete-year";
import { YearForm } from "./year-form";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" });

export default async function AcademicPage() {
  await requireRole("staff");
  const supabase = await createClient();

  const { data: years } = await supabase
    .from("academic_years")
    .select("id, name, starts_on, ends_on, terms(id, number, starts_on, ends_on)")
    .order("starts_on", { ascending: false });

  // Safe to read the clock here: the session check above already made this request-time.
  const today = new Date().toISOString().slice(0, 10);
  const y = Number(today.slice(0, 4));
  const newDefaults = {
    name: `${y}/${y + 1}`,
    starts_on: `${y}-08-01`,
    term1_end: `${y}-11-30`,
    term2_end: `${y + 1}-03-31`,
    term3_end: `${y + 1}-07-31`,
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold gold-bar">Academic setup</h1>
        <Link href="/portal/academic/classes" className="text-sm text-primary underline-offset-4 hover:underline">
          Classes →
        </Link>
      </div>

      <h2 className="mt-6 font-semibold">Academic years</h2>
      <p className="text-sm text-muted-foreground">
        Terms follow each other with no gaps. Today&apos;s date decides the current term.
      </p>

      <ul className="mt-3 space-y-3">
        {(years ?? []).map((yr) => {
          const terms = [...yr.terms].sort((a, b) => a.number - b.number);
          return (
            <li key={yr.id} className="rounded-xl border p-4 bg-card shadow-sm">
              <p className="font-medium">{yr.name}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {terms.map((t) => {
                  const current = t.starts_on <= today && today <= t.ends_on;
                  return (
                    <li key={t.id} className={current ? "font-medium text-primary" : "text-muted-foreground"}>
                      Term {t.number}: {fmt(t.starts_on)} – {fmt(t.ends_on)}
                      {current && " (current)"}
                    </li>
                  );
                })}
              </ul>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-primary">Edit dates</summary>
                <div className="mt-3">
                  <YearForm
                    defaults={{
                      id: yr.id,
                      name: yr.name,
                      starts_on: yr.starts_on,
                      term1_end: terms[0].ends_on,
                      term2_end: terms[1].ends_on,
                      term3_end: terms[2].ends_on,
                    }}
                  />
                  <DeleteYear id={yr.id} name={yr.name} />
                </div>
              </details>
            </li>
          );
        })}
        {!years?.length && <li className="text-sm text-muted-foreground">No academic year yet.</li>}
      </ul>

      <h2 className="mt-8 font-semibold">Add an academic year</h2>
      <div className="mt-3 rounded-xl border p-4 bg-card shadow-sm">
        <YearForm defaults={newDefaults} />
      </div>
    </div>
  );
}
