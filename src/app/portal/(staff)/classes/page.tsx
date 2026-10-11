import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const cols = "id, name, program, level, hifz_unit, sort_order";

export default async function MyClassesPage() {
  const profile = await requireRole("teacher", "staff");
  const supabase = await createClient();

  // Staff see every active class; teachers only the classes they are assigned to.
  let classes;
  if (profile.role === "staff") {
    ({ data: classes } = await supabase.from("classes").select(cols).eq("active", true).order("sort_order").order("name"));
  } else {
    const { data } = await supabase
      .from("class_teachers")
      .select(`classes!inner(${cols}, active)`)
      .eq("teacher_id", profile.id);
    classes = (data ?? [])
      .map((r) => r.classes)
      .filter((c) => c.active)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }

  const counts = await Promise.all(
    (classes ?? []).map((c) =>
      supabase.from("students").select("id", { count: "exact", head: true }).eq("class_id", c.id).eq("status", "active"),
    ),
  );

  return (
    <div>
      <h1 className="text-xl font-semibold">{profile.role === "staff" ? "Classes" : "My classes"}</h1>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {(classes ?? []).map((c, i) => (
          <li key={c.id}>
            <Link href={`/portal/classes/${c.id}`} className="block rounded-lg border p-4 hover:bg-muted">
              <p className="font-medium">{c.name}</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">
                {c.program}
                {c.level ? ` · Level ${c.level}` : ""}
                {c.hifz_unit ? ` · ${c.hifz_unit}` : ""}
              </p>
              <p className="mt-2 text-sm">{counts[i].count ?? 0} active student{counts[i].count === 1 ? "" : "s"}</p>
            </Link>
          </li>
        ))}
        {!classes?.length && (
          <li className="rounded-lg border p-4 text-sm text-muted-foreground">
            You are not assigned to any class yet. Ask staff to assign you.
          </li>
        )}
      </ul>
    </div>
  );
}
