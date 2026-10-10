import { JuzGrid } from "@/components/juz-grid";
import { createClient } from "@/lib/supabase/server";
import { surahs } from "@/lib/surahs";

const gradeLabel: Record<string, string> = { jayyid: "Jayyid", jayyid_jiddan: "Jayyid Jiddan", mumtaz: "Mumtaz" };
const surahName = (n: number | null) => surahs.find((s) => s.number === n)?.name ?? "?";

export async function Juz() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_juz_progress");
  return <JuzGrid rows={data ?? []} />;
}

// Latest 10 entries (RLS: own entries only).
export async function Recent() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("hifz_entries")
    .select("id, entry_date, absent, lesson_type, start_surah, start_ayah, end_surah, end_ayah, pages, grade, note")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <section>
      <h2 className="font-semibold">Recent entries</h2>
      <ul className="mt-2 divide-y rounded-lg border text-sm">
        {(entries ?? []).map((e) => (
          <li key={e.id} className="p-3">
            <p className="font-medium">
              {e.entry_date} · {e.absent ? "Absent" : e.lesson_type === "new" ? "New hifz" : "Muraja'ah"}
            </p>
            {!e.absent && (
              <p className="text-muted-foreground">
                {surahName(e.start_surah)} {e.start_ayah} → {surahName(e.end_surah)} {e.end_ayah} · {e.pages}{" "}
                {e.pages === 1 ? "page" : "pages"} · {gradeLabel[e.grade ?? ""] ?? e.grade}
              </p>
            )}
            {e.note && <p className="text-muted-foreground">“{e.note}”</p>}
          </li>
        ))}
        {!entries?.length && <li className="p-3 text-muted-foreground">No entries yet.</li>}
      </ul>
    </section>
  );
}
