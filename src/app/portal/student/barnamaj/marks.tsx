import { createClient } from "@/lib/supabase/server";

// Own exam marks for one term (RLS: own rows only), in curriculum order.
export async function Marks({ termId }: { termId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_results")
    .select("id, score, books(title, subject, sort_order)")
    .eq("term_id", termId);
  const rows = (data ?? []).sort((a, b) => (a.books?.sort_order ?? 0) - (b.books?.sort_order ?? 0));
  const average = rows.length ? Math.round((rows.reduce((sum, r) => sum + r.score, 0) / rows.length) * 10) / 10 : null;

  return (
    <section>
      <h2 className="text-lg font-semibold">Exam marks</h2>
      {average !== null && (
        <p className="mt-1 text-sm text-muted-foreground">
          Average: <span className="text-lg font-semibold text-primary">{average}</span> / 100
        </p>
      )}
      <ul className="mt-3 divide-y rounded-xl border text-sm bg-card shadow-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p lang="ar" dir="rtl" className="font-arabic text-start font-medium">{r.books?.title}</p>
              <p lang="ar" dir="rtl" className="font-arabic text-start text-muted-foreground">{r.books?.subject}</p>
            </div>
            <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1 font-semibold text-primary">{r.score} / 100</span>
          </li>
        ))}
        {!rows.length && <li className="p-3 text-muted-foreground">No marks recorded for this term.</li>}
      </ul>
    </section>
  );
}
