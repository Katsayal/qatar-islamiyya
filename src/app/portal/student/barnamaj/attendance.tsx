import { createClient } from "@/lib/supabase/server";

const chip: Record<string, { label: string; className: string }> = {
  present: { label: "Present", className: "text-primary" },
  absent: { label: "Absent", className: "text-destructive" },
  excused: { label: "Excused", className: "text-muted-foreground" },
};

const weekday = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });

// Own attendance for one term (RLS: own rows only). A term has about 70 school days, far below the 1,000-row cap.
export async function Attendance({ termId }: { termId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("id, att_date, status")
    .eq("term_id", termId)
    .order("att_date", { ascending: false });
  const rows = data ?? [];
  const count = (status: string) => rows.filter((r) => r.status === status).length;

  return (
    <section>
      <h2 className="font-semibold">Attendance</h2>
      <p className="text-sm text-muted-foreground">
        {count("present")} present · {count("absent")} absent · {count("excused")} excused
      </p>
      <ul className="mt-2 divide-y rounded-lg border text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 p-3">
            <span>{weekday(r.att_date)} {r.att_date}</span>
            <span className={`font-medium ${chip[r.status]?.className ?? ""}`}>{chip[r.status]?.label ?? r.status}</span>
          </li>
        ))}
        {!rows.length && <li className="p-3 text-muted-foreground">No attendance recorded for this term.</li>}
      </ul>
    </section>
  );
}
