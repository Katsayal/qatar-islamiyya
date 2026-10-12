import Image from "next/image";
import { TOTAL_PAGES } from "@/lib/quran";
import { school } from "@/content/school";

export type CardData = {
  studentName: string;
  admissionNo: string;
  className: string;
  program: string;
  termLabel: string;
  issued: string;
  hifz: {
    termPages: number;
    totalPages: number;
    presentDays: number;
    absentDays: number;
    jayyid: number;
    jayyidJiddan: number;
    mumtaz: number;
  } | null;
  barnamaj: {
    exams: { subject: string; title: string; score: number }[];
    average: number | null;
    present: number;
    absent: number;
    excused: number;
  } | null;
  comment: string | null;
  signatureUrl: string | null;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="shrink-0 whitespace-nowrap font-medium">{value}</span>
    </div>
  );
}

// One A4 page. `break-after-page` starts a new sheet for the next student when printing.
export function ReportCard({ d }: { d: CardData }) {
  const h = d.hifz;
  const b = d.barnamaj;
  return (
    <article className="mx-auto max-w-[210mm] break-after-page rounded-lg border bg-background p-6 print:rounded-none print:border-0 print:p-0">
      <header className="border-b pb-3 text-center">
        {/* SVG, unoptimized: prints sharp at any size. */}
        <Image src="/logo.svg" alt="School logo" width={72} height={72} unoptimized className="mx-auto mb-2 size-18" />
        <p lang="ar" dir="rtl" className="font-arabic text-xl font-semibold">{school.nameAr}</p>
        <p className="font-semibold">{school.name}</p>
        <p className="text-xs text-muted-foreground">{school.address} · {school.phones.join(" · ")}</p>
        <p className="mt-2 text-lg font-semibold">Student Report Card</p>
        <p className="text-sm text-muted-foreground">{d.termLabel}</p>
      </header>

      <section className="mt-3 grid gap-x-6 text-sm sm:grid-cols-2">
        <Row label="Student" value={d.studentName} />
        <Row label="Admission no." value={d.admissionNo} />
        <Row label="Class" value={d.className} />
        <Row label="Issued" value={d.issued} />
      </section>

      {h && (
        <section className="mt-4">
          <h2 className="font-semibold">Hifz summary</h2>
          <Row label="New hifz this term" value={`${h.termPages} pages`} />
          <Row
            label="Total memorised so far"
            value={`${h.totalPages} / ${TOTAL_PAGES} pages (${Math.round((h.totalPages / TOTAL_PAGES) * 1000) / 10}%)`}
          />
          <Row label="Days present / absent" value={`${h.presentDays} / ${h.absentDays}`} />
          <Row label="Grades on new lessons" value={`Jayyid ${h.jayyid} · Jayyid Jiddan ${h.jayyidJiddan} · Mumtaz ${h.mumtaz}`} />
        </section>
      )}

      {b && (
        <section className="mt-4">
          <h2 className="font-semibold">Exam results (out of 100)</h2>
          {b.exams.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No marks recorded for this term.</p>
          ) : (
            <table className="mt-1 w-full text-sm">
              <tbody>
                {b.exams.map((e, i) => (
                  <tr key={i} className="border-b">
                    <td lang="ar" dir="rtl" className="font-arabic py-1.5 text-start">{e.title}</td>
                    <td lang="ar" dir="rtl" className="font-arabic py-1.5 text-start text-muted-foreground">{e.subject}</td>
                    <td className="py-1.5 text-end font-medium">{e.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {b.average !== null && <Row label="Average" value={`${b.average} / 100`} />}
          <Row label="Attendance: present / absent / excused" value={`${b.present} / ${b.absent} / ${b.excused}`} />
        </section>
      )}

      <section className="mt-4">
        <h2 className="font-semibold">Teacher&apos;s comment</h2>
        <p className="mt-1 min-h-16 whitespace-pre-line rounded border p-3 text-sm">{d.comment}</p>
      </section>

      <footer className="mt-8 flex justify-end">
        <div className="w-56 text-center text-sm">
          <div className="flex h-16 items-end justify-center">
            {d.signatureUrl && <Image src={d.signatureUrl} alt="" width={200} height={64} unoptimized className="max-h-16 w-auto object-contain" />}
          </div>
          <p className="border-t pt-1">Director&apos;s signature</p>
        </div>
      </footer>
    </article>
  );
}
