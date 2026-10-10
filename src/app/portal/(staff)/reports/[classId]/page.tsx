import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { ReportCard } from "@/components/report-card";
import { requireRole } from "@/lib/auth";
import { loadCards } from "@/lib/report-cards";
import { createClient } from "@/lib/supabase/server";

type Search = { term?: string; student?: string };

export default async function ReportCardsPage({ params, searchParams }: { params: Promise<{ classId: string }>; searchParams: Promise<Search> }) {
  await requireRole("staff");
  const { classId } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: c }, { data: term }] = await Promise.all([
    supabase.from("classes").select("id, name, program").eq("id", classId).maybeSingle(),
    supabase.from("terms").select("id, number, academic_years(name)").eq("id", sp.term ?? "").maybeSingle(),
  ]);
  if (!c || !term) notFound();

  let query = supabase.from("students").select("id, admission_no, full_name").eq("class_id", classId).eq("status", "active").order("full_name").range(0, 1999);
  if (sp.student) query = query.eq("id", sp.student);
  const { data: students } = await query;
  if (!students?.length) notFound();

  const cards = await loadCards(supabase, { classRow: c, term, students });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link href={`/portal/reports?term=${term.id}&class=${classId}`} className="text-sm text-primary underline-offset-4 hover:underline">
          ← Report cards
        </Link>
        <PrintButton />
      </div>
      <div className="flex flex-col gap-6 print:gap-0">
        {cards.map((d) => (
          <ReportCard key={d.admissionNo} d={d} />
        ))}
      </div>
    </div>
  );
}
