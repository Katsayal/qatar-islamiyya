import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { ReportCard, type CardData } from "@/components/report-card";
import { requireRole } from "@/lib/auth";
import { linesToPages } from "@/lib/hifz-progress";
import { createClient } from "@/lib/supabase/server";
import { todayInLagos } from "@/lib/today";

type Search = { term?: string; student?: string };

export default async function ReportCardsPage({ params, searchParams }: { params: Promise<{ classId: string }>; searchParams: Promise<Search> }) {
  await requireRole("staff");
  const { classId } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: c }, { data: term }, { data: settings }] = await Promise.all([
    supabase.from("classes").select("id, name, program").eq("id", classId).maybeSingle(),
    supabase.from("terms").select("id, number, academic_years(name)").eq("id", sp.term ?? "").maybeSingle(),
    supabase.from("school_settings").select("signature_path").eq("id", 1).maybeSingle(),
  ]);
  if (!c || !term) notFound();

  let query = supabase.from("students").select("id, admission_no, full_name").eq("class_id", classId).eq("status", "active").order("full_name").range(0, 1999);
  if (sp.student) query = query.eq("id", sp.student);
  const { data: students } = await query;
  if (!students?.length) notFound();
  const ids = students.map((s) => s.id);
  const isBarnamaj = c.program === "barnamaj";

  // Exam marks: read page by page, the API returns at most 1,000 rows per request.
  type Exam = { student_id: string; score: number; books: { subject: string; title: string; sort_order: number } | null };
  const exams: Exam[] = [];
  if (isBarnamaj) {
    for (let from = 0; ; from += 1000) {
      const { data } = await supabase
        .from("exam_results")
        .select("student_id, score, books(subject, title, sort_order)")
        .eq("term_id", term.id)
        .in("student_id", ids)
        .order("id")
        .range(from, from + 999);
      exams.push(...(data ?? []));
      if ((data?.length ?? 0) < 1000) break;
    }
  }

  const [{ data: stats }, { data: comments }] = await Promise.all([
    supabase.rpc("term_report_stats", { p_class: classId, p_term: term.id }),
    supabase.from("report_comments").select("student_id, comment").eq("term_id", term.id).in("student_id", ids),
  ]);
  const statsById = new Map((stats ?? []).map((s) => [s.student_id, s]));
  const commentById = new Map((comments ?? []).map((m) => [m.student_id, m.comment]));

  let signatureUrl: string | null = null;
  if (settings?.signature_path) {
    const { data } = await supabase.storage.from("private").createSignedUrl(settings.signature_path, 3600);
    signatureUrl = data?.signedUrl ?? null;
  }

  const termLabel = `${term.academic_years?.name ?? ""} · Term ${term.number}`;
  const issued = new Date(`${todayInLagos()}T00:00:00Z`).toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "UTC" });

  const cards: CardData[] = students.map((s) => {
    const st = statsById.get(s.id);
    const marks = exams
      .filter((e) => e.student_id === s.id && e.books)
      .sort((a, b) => a.books!.sort_order - b.books!.sort_order)
      .map((e) => ({ subject: e.books!.subject, title: e.books!.title, score: e.score }));
    const average = marks.length ? Math.round((marks.reduce((sum, m) => sum + m.score, 0) / marks.length) * 10) / 10 : null;
    return {
      studentName: s.full_name,
      admissionNo: s.admission_no,
      className: c.name,
      program: c.program,
      termLabel,
      issued,
      hifz: isBarnamaj
        ? null
        : {
            termPages: linesToPages(st?.term_lines ?? 0),
            totalPages: linesToPages(st?.total_lines ?? 0),
            presentDays: st?.present_days ?? 0,
            absentDays: st?.absent_days ?? 0,
            jayyid: st?.jayyid ?? 0,
            jayyidJiddan: st?.jayyid_jiddan ?? 0,
            mumtaz: st?.mumtaz ?? 0,
          },
      barnamaj: isBarnamaj
        ? { exams: marks, average, present: st?.att_present ?? 0, absent: st?.att_absent ?? 0, excused: st?.att_excused ?? 0 }
        : null,
      comment: commentById.get(s.id) ?? null,
      signatureUrl,
    };
  });

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
