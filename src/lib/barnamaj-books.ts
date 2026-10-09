// Turns the curriculum file (the school's PDF, copied by hand) into rows for the `books` table.
import { barnamajTerms } from "../content/barnamaj.ts";

const studyType: Record<string, string> = { حفظ: "hifz", استظهار: "istizhar", شرح: "sharh" };

export function curriculumRows() {
  let order = 0;
  return barnamajTerms.flatMap((term, i) =>
    term.subjects.flatMap((s) =>
      s.books.map((b) => ({
        term_number: i + 1,
        subject: s.subject,
        title: b.title,
        author: b.author ?? null,
        study_type: (b.type && studyType[b.type]) || null, // blank in the PDF → null
        sort_order: ++order,
      })),
    ),
  );
}
