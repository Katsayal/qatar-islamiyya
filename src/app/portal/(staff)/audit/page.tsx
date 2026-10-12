import { X } from "lucide-react";
import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { ACTIONS, AREAS, idsToName, type Kind, type Lookups } from "@/lib/audit";
import { monthLabel, monthStart } from "@/lib/months";
import { createClient } from "@/lib/supabase/server";
import { btn } from "@/components/buttons";
import { controlClass } from "@/components/form-parts";
import { PickerForm } from "@/components/picker-form";
import { AuditItem } from "./entry";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const PAGE_SIZE = 50;
const input = controlClass;
const pager = "inline-flex h-11 items-center rounded-lg border bg-card px-4 font-medium text-primary hover:border-primary";
const KIND_OF_TABLE: Record<string, Kind> = { students: "students", classes: "classes", books: "books", terms: "terms", profiles: "people" };
const areaList =Object.entries(AREAS).sort((a, b) => a[1].label.localeCompare(b[1].label));

type Search = { person?: string; area?: string; action?: string; month?: string; page?: string };

// Owner only: who created, edited or deleted what (filled by the database, see SCHEMA §8b).
export default async function AuditPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireOwner();
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: people } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_owner")
    .in("role", ["teacher", "staff"])
    .order("full_name");
  const person = sp.person === "system" || people?.some((p) => p.id === sp.person) ? sp.person! : "";
  const area = sp.area && AREAS[sp.area] ? sp.area : "";
  const action = ACTIONS.some((a) => a.key === sp.action) ? sp.action! : "";
  const month = sp.month && monthStart(sp.month) ? sp.month : "";
  const page = Math.max(1, Number(sp.page) || 1);

  let query = supabase
    .from("audit_log")
    .select("id, at, actor_id, actor_name, action, table_name, old, new, context, summary", { count: "exact" })
    .order("at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (person === "system") query = query.is("actor_id", null);
  else if (person) query = query.eq("actor_id", person);
  if (area) query = query.eq("table_name", area);
  if (action) query = query.eq("action", action);
  if (month) {
    // Nigeria is UTC+1 all year (no daylight saving).
    const [y, m] = month.split("-").map(Number);
    const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    query = query.gte("at", `${month}-01T00:00:00+01:00`).lt("at", `${next}-01T00:00:00+01:00`);
  }
  const { data: entries, count } = await query;

  // Name every id on this page: one query per kind.
  const ids = idsToName(entries ?? []);
  const list = (s: Set<string>) => [...s];
  const [students, classes, books, terms, others] = await Promise.all([
    ids.students.size ? supabase.from("students").select("id, full_name, admission_no").in("id", list(ids.students)) : null,
    ids.classes.size ? supabase.from("classes").select("id, name").in("id", list(ids.classes)) : null,
    ids.books.size ? supabase.from("books").select("id, title").in("id", list(ids.books)) : null,
    ids.terms.size ? supabase.from("terms").select("id, number, academic_years(name)").in("id", list(ids.terms)) : null,
    ids.people.size ? supabase.from("profiles").select("id, full_name").in("id", list(ids.people)) : null,
  ]);
  const look: Lookups = {
    students: new Map((students?.data ?? []).map((s) => [s.id, `${s.full_name} (${s.admission_no})`])),
    classes: new Map((classes?.data ?? []).map((c) => [c.id, c.name])),
    books: new Map((books?.data ?? []).map((b) => [b.id, b.title])),
    terms: new Map((terms?.data ?? []).map((t) => [t.id, `Term ${t.number}, ${t.academic_years?.name ?? ""}`])),
    people: new Map((others?.data ?? []).map((p) => [p.id, p.full_name])),
  };
  // Records deleted since: take their name from the log's own delete row.
  const missing = (Object.keys(ids) as Kind[]).flatMap((k) => list(ids[k]).filter((id) => !look[k].has(id)));
  if (missing.length) {
    const { data: gone } = await supabase
      .from("audit_log")
      .select("table_name, row_id, context")
      .eq("action", "delete")
      .in("table_name", Object.keys(KIND_OF_TABLE))
      .in("row_id", missing);
    for (const g of gone ?? []) {
      const kind = KIND_OF_TABLE[g.table_name];
      const name = AREAS[g.table_name].name((g.context ?? {}) as Record<string, unknown>, look);
      if (kind && g.row_id && name) look[kind].set(g.row_id, `${name} (deleted)`);
    }
  }
  const roleOf = new Map((people ?? []).map((p) => [p.id, p.is_owner ? "owner" : p.role]));

  const total = count ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ person, area, action, month, page: String(n) })) if (v) params.set(k, v);
    return `/portal/audit?${params}`;
  };
  const filtered = person || area || action || month;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold gold-bar">Activity log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Owner only. Who created, edited or deleted what, recorded by the database. Rows cannot be changed or removed from the app.
      </p>

      {/* key: rebuild when the URL filters change (e.g. Clear), so the boxes show what is applied */}
      <PickerForm key={[person, area, action, month].join("|")} action="/portal/audit" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <select name="person" defaultValue={person} aria-label="Person" className={`${input} col-span-2 md:col-span-1`}>
          <option value="">Everyone</option>
          {(people ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
          <option value="system">Website / system</option>
        </select>
        <select name="area" defaultValue={area} aria-label="Area" className={input}>
          <option value="">All areas</option>
          {areaList.map(([key, a]) => (
            <option key={key} value={key}>{a.label}</option>
          ))}
        </select>
        <select name="action" defaultValue={action} aria-label="Action" className={input}>
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a.key} value={a.key}>{a.label}</option>
          ))}
        </select>
        <input name="month" type="month" defaultValue={month} aria-label="Month" className={`${input} col-span-2 md:col-span-1`} />
        {filtered && (
          <Link href="/portal/audit" className={`${btn.secondary} col-span-2 md:col-span-1`}>
            <X aria-hidden /> Clear
          </Link>
        )}
      </PickerForm>

      <p className="mt-4 text-sm text-muted-foreground">
        {total} {total === 1 ? "entry" : "entries"}{month && ` in ${monthLabel(month)}`}
      </p>
      <ul className="mt-2 space-y-2">
        {(entries ?? []).map((e) => (
          <AuditItem key={e.id} entry={e} look={look} role={e.actor_id ? roleOf.get(e.actor_id) : undefined} />
        ))}
        {!entries?.length && (
          <li className="rounded-xl border bg-card p-4 text-sm text-muted-foreground shadow-sm">
            {filtered ? "Nothing matches these filters." : "Nothing recorded yet."}
          </li>
        )}
      </ul>

      {lastPage > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)} className={pager}>← Previous</Link> : <span />}
          <span className="text-muted-foreground">Page {page} of {lastPage}</span>
          {page < lastPage ? <Link href={pageHref(page + 1)} className={pager}>Next →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
