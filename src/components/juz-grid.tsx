type JuzRow = { juz: number; total_ayahs: number; done_ayahs: number };

// 30 cells: plain = nothing yet, light = started, solid = every ayah of the juz memorised.
export function JuzGrid({ rows }: { rows: JuzRow[] }) {
  const complete = rows.filter((r) => r.done_ayahs >= r.total_ayahs).length;

  return (
    <section>
      <h2 className="font-semibold">Juz</h2>
      <p className="text-sm text-muted-foreground">{complete} of 30 complete</p>
      <ul className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {rows.map((r) => {
          const done = r.done_ayahs >= r.total_ayahs;
          const started = r.done_ayahs > 0;
          const style = done
            ? "border-primary bg-primary text-primary-foreground"
            : started
              ? "border-primary/50 bg-primary/15"
              : "text-muted-foreground";
          return (
            <li
              key={r.juz}
              title={`Juz ${r.juz}: ${r.done_ayahs} of ${r.total_ayahs} ayahs`}
              aria-label={`Juz ${r.juz}: ${r.done_ayahs} of ${r.total_ayahs} ayahs`}
              className={`flex h-11 items-center justify-center rounded-md border text-sm font-medium ${style}`}
            >
              {r.juz}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
