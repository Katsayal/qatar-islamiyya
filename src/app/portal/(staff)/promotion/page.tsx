import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PromoteForm } from "./promote-form";

const input = "h-11 rounded-md border bg-background px-3 text-base";

export default async function PromotionPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, program, level")
    .eq("active", true)
    .order("sort_order")
    .order("name");
  const from = (classes ?? []).find((c) => c.id === sp.from);

  const { data: students } = from
    ? await supabase.from("students").select("id, full_name, admission_no").eq("class_id", from.id).eq("status", "active").order("full_name")
    : { data: null };

  // Obvious next class: same program, one level up (Tahfiz). Otherwise staff choose.
  const next = from?.level ? (classes ?? []).find((c) => c.program === from.program && c.level === from.level! + 1) : undefined;

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">Promotion</h1>
      <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
        Print the final term&apos;s{" "}
        <Link href="/portal/reports" className="font-medium underline underline-offset-4">report cards</Link> first. A class&apos;s cards list only the
        students who are in it now.
      </p>

      <form className="mt-4 flex flex-col gap-3">
        <select name="from" defaultValue={from?.id ?? ""} required className={input}>
          <option value="" disabled>Move students out of…</option>
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.program}
              {c.level ? ` · level ${c.level}` : ""})
            </option>
          ))}
        </select>
        <button className="h-11 rounded-md border px-5 font-medium hover:bg-muted">Show students</button>
      </form>

      {from && students && (
        <PromoteForm
          key={from.id}
          fromId={from.id}
          fromName={from.name}
          students={students}
          destinations={(classes ?? []).filter((c) => c.id !== from.id)}
          defaultTo={next?.id ?? ""}
        />
      )}
    </div>
  );
}
