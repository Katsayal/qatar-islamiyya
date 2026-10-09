// Hifz amount calculations for the 604-page, 15-line Madinah mushaf.
// Pure functions (no imports) so they can be tested with plain `node --test`.
// Ayah positions come from the quran_ayahs table.

export const LINES_PER_PAGE = 15;
export const TOTAL_PAGES = 604;

export type AyahPos = {
  surah: number;
  ayah: number;
  page: number; // where the ayah starts
  line: number;
  end_page: number; // where the ayah ends
  end_line: number;
};

export type Amount = {
  start_page: number;
  end_page: number;
  lines: number;
  pages: number; // lines / 15, 2 decimals
};

// Position of a line counted from the start of the mushaf.
function lineIndex(page: number, line: number) {
  return (page - 1) * LINES_PER_PAGE + line;
}

function toPages(lines: number) {
  return Math.round((lines / LINES_PER_PAGE) * 100) / 100;
}

// Juz 'Amma is memorised from An-Nas backwards, so teachers often enter the range
// the other way round. Returns [first, last] in mushaf order.
export function swapIfReversed<T extends { surah: number; ayah: number }>(a: T, b: T): [T, T] {
  const reversed = b.surah < a.surah || (b.surah === a.surah && b.ayah < a.ayah);
  return reversed ? [b, a] : [a, b];
}

// Range entered by surah/ayah. Lines between two surahs include the
// surah header + basmalah lines (agreed simplification).
export function amountForRange(start: AyahPos, end: AyahPos): Amount {
  const endsBeforeStart =
    end.surah < start.surah || (end.surah === start.surah && end.ayah < start.ayah);
  if (endsBeforeStart) throw new Error("The end ayah comes before the start ayah.");

  const lines = lineIndex(end.end_page, end.end_line) - lineIndex(start.page, start.line) + 1;
  return { start_page: start.page, end_page: end.end_page, lines, pages: toPages(lines) };
}

// Range entered by page (whole pages).
export function amountForPages(startPage: number, endPage: number): Amount {
  const valid = (p: number) => Number.isInteger(p) && p >= 1 && p <= TOTAL_PAGES;
  if (!valid(startPage) || !valid(endPage)) throw new Error(`Pages must be 1–${TOTAL_PAGES}.`);
  if (endPage < startPage) throw new Error("The end page comes before the start page.");

  const lines = (endPage - startPage + 1) * LINES_PER_PAGE;
  return { start_page: startPage, end_page: endPage, lines, pages: toPages(lines) };
}
