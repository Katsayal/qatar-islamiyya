import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ClassForm, type ClassDefaults } from "../class-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("staff");
  const { id } = await params;
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["teacher", "staff"]) // some staff also teach
    .eq("active", true)
    .order("full_name");

  let defaults: ClassDefaults = {
    name: "",
    name_ar: "",
    program: "tahfiz",
    level: "",
    hifz_unit: "",
    sort_order: "0",
    active: true,
    teacher_ids: [],
  };

  if (id !== "new") {
    const { data: c } = await supabase
      .from("classes")
      .select("id, name, name_ar, program, level, hifz_unit, sort_order, active, class_teachers(teacher_id)")
      .eq("id", id)
      .maybeSingle();
    if (!c) notFound();
    defaults = {
      id: c.id,
      name: c.name,
      name_ar: c.name_ar ?? "",
      program: c.program,
      level: c.level?.toString() ?? "",
      hifz_unit: c.hifz_unit ?? "",
      sort_order: String(c.sort_order),
      active: c.active,
      teacher_ids: c.class_teachers.map((t) => t.teacher_id),
    };
  }

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href="/portal/academic/classes" className="text-sm text-primary underline-offset-4 hover:underline">
          ← Classes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold gold-bar">{id === "new" ? "Add class" : "Edit class"}</h1>
        <div className="mt-4">
          <ClassForm defaults={defaults} teachers={teachers ?? []} />
        </div>
      </div>
    </FreshOnVisit>
  );
}
