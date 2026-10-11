import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";

const chip: Record<string, { label: string; tone: "good" | "bad" | "muted" }> = {
  present: { label: "Present", tone: "good" },
  absent: { label: "Absent", tone: "bad" },
  excused: { label: "Excused", tone: "muted" },
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
      <h2 className="text-lg font-semibold">Attendance</h2>
      <ul className="mt-2 grid grid-cols-3 gap-3 text-center">
        {(["present", "absent", "excused"] as const).map((k) => (
          <li key={k} className="rounded-xl border bg-card p-3 shadow-sm">
            <p className={`text-2xl font-semibold ${k === "present" ? "text-primary" : k === "absent" ? "text-destructive" : ""}`}>
              {count(k)}
            </p>
            <p className="text-xs text-muted-foreground">{chip[k].label}</p>
          </li>
        ))}
      </ul>
      <ul className="mt-3 divide-y rounded-xl border text-sm bg-card shadow-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 p-3">
            <span>{weekday(r.att_date)} {r.att_date}</span>
            <StatusBadge tone={chip[r.status]?.tone ?? "muted"}>{chip[r.status]?.label ?? r.status}</StatusBadge>
          </li>
        ))}
        {!rows.length && <li className="p-3 text-muted-foreground">No attendance recorded for this term.</li>}
      </ul>
    </section>
  );
}
