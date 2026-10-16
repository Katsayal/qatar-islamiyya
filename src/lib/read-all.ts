// The database API returns at most 1,000 rows per request. This reads a list in chunks until a chunk comes
// back short, so a big export is never cut off. `page(from, to)` returns rows from..to (inclusive).
export async function readAll<T>(page: (from: number, to: number) => Promise<T[]>, size = 1000): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += size) {
    const rows = await page(from, from + size - 1);
    all.push(...rows);
    if (rows.length < size) return all;
  }
}
