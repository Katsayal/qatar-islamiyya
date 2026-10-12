// Turns the curriculum file (the school's PDF, copied by hand) into rows for the `books` table.
import { barnamajTerms } from "../content/barnamaj.ts";

const studyType: Record<string, string> = { حفظ: "hifz", استظهار: "istizhar", شرح: "sharh" };

export type BookStatus = "Not started" | "In progress" | "Finished";

// A book's dates are planned dates ("Starting on" / "Finishing on"), so compare them with today (ISO dates).
// Finished once the finishing date has arrived; in progress once the starting date has arrived.
export function bookStatus(b: { started_on: string | null; finished_on: string | null }, today: string): BookStatus {
  if (b.finished_on && b.finished_on <= today) return "Finished";
  if (b.started_on && b.started_on <= today) return "In progress";
  return "Not started";
}

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
