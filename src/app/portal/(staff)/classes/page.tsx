import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const cols = "id, name, program, level, hifz_unit, sort_order";
type Klass = { id: string; name: string; program: string; level: number | null; hifz_unit: string | null; sort_order: number };

const byOrder = (a: Klass, b: Klass) => a.sort_order - b.sort_order || a.name.localeCompare(b.name);

export default async function MyClassesPage() {
  const profile = await requireRole("teacher", "staff");
  const supabase = await createClient();

  // Classes this person is assigned to (teachers, and staff who also teach).
  const { data: mine } = await supabase
    .from("class_teachers")
    .select(`classes!inner(${cols}, active)`)
    .eq("teacher_id", profile.id);
  const taught: Klass[] = (mine ?? [])
    .map((r) => r.classes)
    .filter((c) => c.active)
    .sort(byOrder);

  // Staff also get every other active class (they can open and record for any class).
  let others: Klass[] = [];
  if (profile.role === "staff") {
    const { data: all } = await supabase.from("classes").select(cols).eq("active", true).order("sort_order").order("name");
    const taughtIds = new Set(taught.map((c) => c.id));
    others = (all ?? []).filter((c) => !taughtIds.has(c.id));
  }

  const counts = new Map(
    await Promise.all(
      [...taught, ...others].map(async (c) => {
        const { count } = await supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("class_id", c.id)
          .eq("status", "active");
        return [c.id, count ?? 0] as const;
      }),
    ),
  );

  const isStaff = profile.role === "staff";
  return (
    <div>
      <h1 className="text-2xl font-semibold gold-bar">{isStaff ? "Classes" : "My classes"}</h1>

      {(!isStaff || taught.length > 0) && (
        <section className="mt-4">
          {isStaff && <h2 className="font-semibold">Classes I teach</h2>}
          <ClassList classes={taught} counts={counts} />
          {!taught.length && (
            <p className="rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">
              You are not assigned to any class yet. Ask staff to assign you.
            </p>
          )}
        </section>
      )}

      {isStaff && (
        <section className="mt-6">
          <h2 className="font-semibold">{taught.length ? "All other classes" : "All classes"}</h2>
          <ClassList classes={others} counts={counts} />
          {!others.length && <p className="mt-2 text-sm text-muted-foreground">No other active classes.</p>}
        </section>
      )}
    </div>
  );
}

function ClassList({ classes, counts }: { classes: Klass[]; counts: Map<string, number> }) {
  if (!classes.length) return null;
  return (
    <ul className="mt-2 grid gap-3 md:grid-cols-2">
      {classes.map((c) => {
        const n = counts.get(c.id) ?? 0;
        return (
          <li key={c.id}>
            <Link href={`/portal/classes/${c.id}`} className="block rounded-xl border p-4 hover:bg-muted bg-card shadow-sm">
              <p className="font-medium">{c.name}</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">
                {c.program}
                {c.level ? ` · Level ${c.level}` : ""}
                {c.hifz_unit ? ` · ${c.hifz_unit}` : ""}
              </p>
              <p className="mt-2 text-sm">
                {n} active student{n === 1 ? "" : "s"}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
