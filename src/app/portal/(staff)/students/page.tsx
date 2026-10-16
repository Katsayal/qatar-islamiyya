import { Download, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { STUDENT_PROGRAMS, STUDENT_STATUSES, parseStudentFilters } from "@/lib/student-filters";
import { createClient } from "@/lib/supabase/server";
import { btn } from "@/components/buttons";
import { controlClass, SearchField } from "@/components/form-parts";
import { PageTabs, studentTabs } from "@/components/page-tabs";
import { Pager } from "@/components/pager";
import { PickerForm } from "@/components/picker-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";
import { StudentList } from "./student-list";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const PAGE_SIZE = 50;
const programs = STUDENT_PROGRAMS;
const statuses = STUDENT_STATUSES;

type Search = { q?: string; program?: string; class?: string; status?: string; page?: string };

const input = controlClass;

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const supabase = await createClient();

  const { q, program, status } = parseStudentFilters(sp);
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
    .order("admission_no")
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

  return (
    <div>
      <PageTabs tabs={studentTabs} active="/portal/students" />
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold gold-bar">Students</h1>
        <Link href="/portal/students/new" className={btn.create}>
          <UserPlus aria-hidden /> Add student
        </Link>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {programs.map((p, i) => (
          <li key={p.key} className="rounded-full border px-3 py-1">
            {p.label}: <span className="font-medium">{activeCounts[i].count ?? 0}</span>
          </li>
        ))}
        <li className="py-1 text-muted-foreground">active students</li>
      </ul>

      {/* key: rebuild when the URL filters change (e.g. Clear), so the boxes show what is applied */}
      <PickerForm key={[q, program, sp.class, status].join("|")} action="/portal/students" className="mt-4 grid gap-3 md:grid-cols-4">
        <SearchField defaultValue={q} className="md:col-span-4" />
        <select name="program" defaultValue={program ?? ""} aria-label="Program" className={input}>
          <option value="">All programs</option>
          {programs.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
        <select name="class" defaultValue={sp.class ?? ""} aria-label="Class" className={input}>
          <option value="">All classes</option>
          {(classes ?? []).filter((c) => c.active).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} aria-label="Status" className={`${input} capitalize`}>
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        {(q || program || sp.class || status !== "active") && (
          <Link href="/portal/students" className={btn.secondary}>
            <X aria-hidden /> Clear
          </Link>
        )}
      </PickerForm>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-sm text-muted-foreground">
          {total} student{total === 1 ? "" : "s"} found
        </p>
        {total > 0 && (
          // A file download: a plain GET form (no JavaScript needed). It exports every page of what the list shows.
          <form action="/portal/students/export" method="get" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {q && <input type="hidden" name="q" value={q} />}
            {program && <input type="hidden" name="program" value={program} />}
            {sp.class && <input type="hidden" name="class" value={sp.class} />}
            <input type="hidden" name="status" value={status} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="medical" value="1" className="size-5" />
              Include medical notes
            </label>
            <button type="submit" className={btn.secondary}>
              <Download aria-hidden /> Export CSV ({total})
            </button>
          </form>
        )}
      </div>

      {/* key: ticks belong to one page of one filter; FreshOnVisit: no stale ticks after visiting a profile and coming back */}
      <FreshOnVisit>
        <StudentList
          key={[q, program, sp.class, status, page].join("|")}
          students={(students ?? []).map((s) => {
            const c = s.class_id ? classById.get(s.class_id) : undefined;
            return { id: s.id, full_name: s.full_name, admission_no: s.admission_no, gender: s.gender, status: s.status, classLabel: c ? `${c.name} (${c.program})` : "No class" };
          })}
          classes={(classes ?? []).filter((c) => c.active).map((c) => ({ id: c.id, name: c.name, program: c.program }))}
          emptyText={q || program || sp.class || status !== "active" ? "No students match these filters." : "No students yet. Use Add student."}
        />
      </FreshOnVisit>

      <Pager path="/portal/students" params={{ q, program, class: sp.class, status }} page={page} lastPage={lastPage} />
    </div>
  );
}
