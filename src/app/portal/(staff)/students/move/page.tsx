import { requireRole } from "@/lib/auth";
import { FreshOnVisit } from "@/components/fresh-on-visit";
import { PageTabs, studentTabs } from "@/components/page-tabs";
import { MoveForm } from "./move-form";

export default async function MoveStudentsPage() {
  await requireRole("staff");

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <PageTabs tabs={studentTabs} active="/portal/students/move" />
        <h1 className="text-2xl font-semibold gold-bar">Move students (CSV)</h1>

        <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm">
          <li>
            On the Students tab filter to the class you want and use <strong>Export CSV</strong>, then change the <strong>Class</strong> column to the new
            class (for example a halqa), or paste the school&apos;s list into it. Only <strong>Admission No.</strong> and{" "}
            <strong>Class</strong> are read; other columns are ignored.
          </li>
          <li>
            Delete the rows of students who stay where they are (or leave them: students already in that class are
            skipped). The class must be an active class and written exactly as in Academic setup.
          </li>
          <li>
            Check the file first. Nothing is moved until every row is valid, and only the class changes: bio data, status,
            logins and records stay as they are. Past hifz entries keep the class they were recorded in.
          </li>
        </ol>

        <div className="mt-6">
          <MoveForm />
        </div>
      </div>
    </FreshOnVisit>
  );
}
