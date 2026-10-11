import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const programs = [
  { key: "tahfiz", label: "Tahfiz" },
  { key: "maahad", label: "Ma'ahad" },
  { key: "barnamaj", label: "Barnamaj" },
];

export default async function ClassesPage() {
  await requireRole("staff");
  const supabase = await createClient();

  const [{ data: classes }, { data: teachers }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, name_ar, program, level, hifz_unit, active, class_teachers(teacher_id)")
      .order("sort_order")
      .order("name"),
    supabase.from("profiles").select("id, full_name").eq("role", "teacher"),
  ]);
  const teacherName = new Map((teachers ?? []).map((t) => [t.id, t.full_name]));

  return (
    <div>
      <Link href="/portal/academic" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Academic setup
      </Link>
      <div className="mt-2 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Classes</h1>
        <Link href="/portal/academic/classes/new" className={buttonVariants() + " h-10 px-4"}>
          Add class
        </Link>
      </div>

      {programs.map((p) => {
        const list = (classes ?? []).filter((c) => c.program === p.key);
        return (
          <section key={p.key} className="mt-6">
            <h2 className="font-semibold">{p.label}</h2>
            <ul className="mt-2 space-y-2">
              {list.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/portal/academic/classes/${c.id}`}
                    className={`block rounded-lg border p-3 hover:bg-muted ${c.active ? "" : "opacity-60"}`}
                  >
                    <p className="font-medium">
                      {c.name}
                      {c.name_ar && (
                        <span lang="ar" dir="rtl" className="font-arabic ms-2 text-muted-foreground">
                          {c.name_ar}
                        </span>
                      )}
                      {!c.active && <span className="ms-2 text-xs text-muted-foreground">(inactive)</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[c.level ? `Level ${c.level}` : null, c.hifz_unit].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Teachers:{" "}
                      {c.class_teachers.map((ct) => teacherName.get(ct.teacher_id) ?? "?").join(", ") || "none yet"}
                    </p>
                  </Link>
                </li>
              ))}
              {!list.length && <li className="text-sm text-muted-foreground">No classes yet.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
