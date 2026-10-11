type JuzRow = { juz: number; total_ayahs: number; done_ayahs: number };

// 30 cells: plain = nothing yet, light = started, solid = every ayah of the juz memorised.
export function JuzGrid({ rows }: { rows: JuzRow[] }) {
  const complete = rows.filter((r) => r.done_ayahs >= r.total_ayahs).length;

  return (
    <section>
      <h2 className="text-lg font-semibold">Juz</h2>
      <p className="text-sm text-muted-foreground">{complete} of 30 complete</p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-3 rounded border border-primary bg-primary" />Complete</span>
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-3 rounded border border-gold bg-gold/25" />Started</span>
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-3 rounded border bg-card" />Not yet</span>
      </p>
      <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {rows.map((r) => {
          const done = r.done_ayahs >= r.total_ayahs;
          const started = r.done_ayahs > 0;
          const style = done
            ? "border-primary bg-primary text-primary-foreground"
            : started
              ? "border-gold bg-gold/25 text-foreground"
              : "bg-card text-muted-foreground";
          return (
            <li
              key={r.juz}
              title={`Juz ${r.juz}: ${r.done_ayahs} of ${r.total_ayahs} ayahs`}
              aria-label={`Juz ${r.juz}: ${r.done_ayahs} of ${r.total_ayahs} ayahs`}
              className={`flex h-11 items-center justify-center rounded-lg border text-sm font-medium ${style}`}
            >
              {r.juz}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
