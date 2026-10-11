import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { controlClass } from "@/components/form-parts";
import { StatusBadge } from "@/components/status-badge";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const PAGE_SIZE = 25;
const programs = [
  { key: "tahfiz", label: "Tahfiz" },
  { key: "maahad", label: "Ma'ahad" },
  { key: "barnamaj", label: "Barnamaj" },
];
const statuses = ["active", "graduated", "withdrawn", "archived", "all"];

type Search = { q?: string; program?: string; class?: string; status?: string; page?: string };

const input = controlClass;

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const supabase = await createClient();

  const q = (sp.q ?? "").replace(/[%,()*]/g, " ").trim();
  const program = programs.some((p) => p.key === sp.program) ? sp.program : undefined;
  const status = statuses.includes(sp.status ?? "") ? sp.status! : "active";
  const page = Math.max(1, Number(sp.page) || 1);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, program, level, active")
    .order("sort_order")
    .order("name");
  const classById = new Map((classes ?? []).map((c) => [c.id, c]));
  const idsOf = (p: string) => (classes ?? []).filter((c) => c.program === p).map((c) => c.id);

  let query = supabase
    .from("students")
    .select("id, admission_no, full_name, gender, status, class_id", { count: "exact" })
    .order("full_name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`full_name.ilike.%${q}%,admission_no.ilike.%${q}%`);
  if (sp.class) query = query.eq("class_id", sp.class);
  else if (program) query = query.in("class_id", idsOf(program));

  const [{ data: students, count }, ...activeCounts] = await Promise.all([
    query,
    ...programs.map((p) =>
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .in("class_id", idsOf(p.key)),
    ),
  ]);

  const total = count ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, program, class: sp.class, status, page: String(n) })) {
      if (v) params.set(k, v);
    }
    return `/portal/students?${params}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold gold-bar">Students</h1>
        <Link href="/portal/students/new" className={buttonVariants() + " h-10 px-4"}>
          Add student
        </Link>
      </div>

      <p className="mt-2 text-sm">
        <Link href="/portal/students/import" className="text-primary underline-offset-4 hover:underline">
          Import CSV
        </Link>
        {" · "}
        {/* A file download, not a page: a plain <a> is correct here. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/portal/students/export" className="text-primary underline-offset-4 hover:underline">
          Export CSV
        </a>
      </p>

      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {programs.map((p, i) => (
          <li key={p.key} className="rounded-full border px-3 py-1">
            {p.label}: <span className="font-medium">{activeCounts[i].count ?? 0}</span>
          </li>
        ))}
        <li className="py-1 text-muted-foreground">active students</li>
      </ul>

      <form className="mt-4 grid gap-3 md:grid-cols-5">
        <input name="q" defaultValue={q} placeholder="Search Name or admission no." className={`${input} md:col-span-2`} />
        <select name="program" defaultValue={program ?? ""} className={input}>
          <option value="">All programs</option>
          {programs.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
        <select name="class" defaultValue={sp.class ?? ""} className={input}>
          <option value="">All classes</option>
          {(classes ?? []).filter((c) => c.active).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={input}>
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <div className="flex gap-2 md:col-span-5">
          <button className="h-11 rounded-lg bg-primary px-5 text-primary-foreground hover:bg-primary/90">Filter</button>
          <Link href="/portal/students" className="flex h-11 items-center rounded-lg border px-5 bg-card">Reset</Link>
        </div>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {total} student{total === 1 ? "" : "s"} found
      </p>

      <ul className="mt-2 divide-y rounded-xl border bg-card shadow-sm">
        {(students ?? []).map((s) => {
          const c = s.class_id ? classById.get(s.class_id) : undefined;
          return (
            <li key={s.id}>
            <Link href={`/portal/students/${s.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-muted">
              <div className="min-w-0">
                <p className="truncate font-medium">{s.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.admission_no} · {c ? `${c.name} (${c.program})` : "No class"}
                </p>
              </div>
              <div className="shrink-0 text-end text-xs capitalize text-muted-foreground">
                <p>{s.gender}</p>
                {s.status !== "active" && <StatusBadge tone="muted">{s.status}</StatusBadge>}
              </div>
            </Link>
          </li>
          );
        })}
        {!students?.length && (
          <li className="p-4 text-sm text-muted-foreground">
            {q || program || sp.class || status !== "active" ? "No students match these filters." : "No students yet. Use Add student."}
          </li>
        )}
      </ul>

      {lastPage > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)} className="inline-flex h-11 items-center rounded-lg border bg-card px-4 font-medium text-primary hover:border-primary">← Previous</Link> : <span />}
          <span className="text-muted-foreground">Page {page} of {lastPage}</span>
          {page < lastPage ? <Link href={pageHref(page + 1)} className="inline-flex h-11 items-center rounded-lg border bg-card px-4 font-medium text-primary hover:border-primary">Next →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
