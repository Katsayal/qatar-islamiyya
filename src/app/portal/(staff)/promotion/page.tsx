import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PromoteForm } from "./promote-form";
import { controlClass } from "@/components/form-parts";
import { FreshOnVisit } from "@/components/fresh-on-visit";
import { PickerForm } from "@/components/picker-form";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const input = controlClass;

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
    <FreshOnVisit>
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold gold-bar">Promotion</h1>
        <p className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          Print the final term&apos;s{" "}
          <Link href="/portal/reports" className="font-medium underline underline-offset-4">report cards</Link> first. A class&apos;s cards list only the
          students who are in it now.
        </p>

        <PickerForm action="/portal/promotion" className="mt-4 flex flex-col gap-3">
          <select name="from" defaultValue={from?.id ?? ""} required aria-label="Class to move students out of" className={input}>
            <option value="" disabled>Move students out of…</option>
            {(classes ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.program}
                {c.level ? ` · level ${c.level}` : ""})
              </option>
            ))}
          </select>
        </PickerForm>

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
    </FreshOnVisit>
  );
}
