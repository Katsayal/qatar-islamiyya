import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RateForm } from "./rate-form";
import { controlClass, SearchField } from "@/components/form-parts";
import { PickerForm } from "@/components/picker-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const input = controlClass;

// Owner only: the fixed monthly salary of every teacher, staff member and the owner.
export default async function SalaryRatesPage({ searchParams }: { searchParams: Promise<{ show?: string; q?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const showAll = sp.show === "all";
  const q = (sp.q ?? "").trim().toLowerCase();
  const supabase = await createClient();

  const [{ data: people }, { data: rates }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, is_owner, active").in("role", ["teacher", "staff"]).eq("hidden", false).order("full_name"),
    supabase.from("salary_rates").select("profile_id, monthly_amount"),
  ]);
  const rate = new Map((rates ?? []).map((r) => [r.profile_id, r.monthly_amount]));
  const list = (people ?? []).filter((p) => (showAll || p.active) && (!q || p.full_name.toLowerCase().includes(q)));
  const missing = list.filter((p) => p.active && !rate.has(p.id)).length;

  return (
    <FreshOnVisit>
      <div className="max-w-2xl">
        <Link href="/portal/salaries" className="text-sm text-primary underline-offset-4 hover:underline">← Salaries</Link>
        <h1 className="mt-2 text-2xl font-semibold gold-bar">Salary amounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The fixed monthly salary of each person. {missing > 0 ? `${missing} active ${missing === 1 ? "person has" : "people have"} no salary set yet.` : "Everyone listed has a salary set."}
        </p>

        <PickerForm action="/portal/salaries/rates" className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <SearchField defaultValue={sp.q ?? ""} placeholder="Search by name" />
          <select name="show" defaultValue={showAll ? "all" : "active"} aria-label="Show" className={input}>
            <option value="active">Active accounts</option>
            <option value="all">Including disabled</option>
          </select>
        </PickerForm>

        <ul className="mt-4 divide-y rounded-xl border bg-card shadow-sm">
          {list.map((p) => (
            <li key={p.id} className="p-3">
              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.full_name}</span>
                    <span className="text-sm capitalize text-muted-foreground">
                      {p.role}{p.is_owner && " · owner"}{!p.active && " · disabled"}
                    </span>
                  </span>
                  <span className={`shrink-0 text-sm ${rate.has(p.id) ? "font-medium" : "text-muted-foreground"}`}>
                    {rate.has(p.id) ? naira(rate.get(p.id)!) : "Not set"}
                  </span>
                </summary>
                <div className="mt-3">
                  <RateForm profileId={p.id} amount={rate.get(p.id) ?? null} />
                </div>
              </details>
            </li>
          ))}
          {!list.length && <li className="p-4 text-sm text-muted-foreground">Nobody matches.</li>}
        </ul>
      </div>
    </FreshOnVisit>
  );
}
