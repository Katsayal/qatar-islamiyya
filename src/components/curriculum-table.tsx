import { barnamajTerms } from "@/content/barnamaj";

// One table per term. Subject rows group the books under them.
export function CurriculumTable() {
  return (
    <div lang="ar" dir="rtl" className="font-arabic mt-4 space-y-8">
      {barnamajTerms.map((term) => (
        <div key={term.name}>
          <h4 className="text-lg font-semibold text-primary">
            {term.name}{" "}
            <span lang="en" dir="ltr" className="font-sans text-sm font-normal text-muted-foreground">
              ({term.months})
            </span>
          </h4>
          <div className="mt-2 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-start">الكتاب</th>
                  <th className="p-2 text-start">المؤلف</th>
                  <th className="p-2 text-start">نوع القراءة</th>
                </tr>
              </thead>
              {term.subjects.map((s) => (
                <tbody key={s.subject} className="border-t">
                  <tr className="bg-muted/50">
                    <th colSpan={3} className="p-2 text-start font-semibold">
                      {s.subject}
                    </th>
                  </tr>
                  {s.books.map((b) => (
                    <tr key={b.title} className="border-t align-top">
                      <td className="p-2 font-medium">{b.title}</td>
                      <td className="p-2 text-muted-foreground">{b.author ?? "—"}</td>
                      <td className="whitespace-nowrap p-2">{b.type ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
