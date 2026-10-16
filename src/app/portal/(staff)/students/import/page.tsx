import { requireRole } from "@/lib/auth";
import { PageTabs, studentTabs } from "@/components/page-tabs";
import { ImportForm } from "./import-form";

export default async function ImportPage() {
  await requireRole("staff");

  return (
    <div className="max-w-xl">
      <PageTabs tabs={studentTabs} active="/portal/students/import" />
      <h1 className="text-2xl font-semibold gold-bar">Import students (CSV)</h1>

      <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm">
        <li>
          Download the{" "}
          {/* A file download, not a page: a plain <a> is correct here. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/portal/students/export?template=1" className="text-primary underline-offset-4 hover:underline">
            template
          </a>{" "}
          and fill it in with Excel. Save as <strong>CSV UTF-8</strong> so Arabic names stay correct.
        </li>
        <li>
          Required on every row: <strong>Admission No.</strong>, <strong>Full Name</strong> and <strong>Gender</strong> (male or
          female). Headings are matched ignoring capitals and spaces, so <code>Full Name</code> and <code>full_name</code> are
          the same.
        </li>
        <li>
          Can be empty (write <code>X</code> or leave blank), then completed later in the student form:{" "}
          <strong>Date of Birth</strong>, <strong>Blood Group</strong> (A+, A-, B+, B-, AB+, AB-, O+, O- or Unknown),{" "}
          <strong>Address</strong>, <strong>Local Government</strong> and <strong>Previous Islamiyya</strong>. A value that is
          filled must be valid. Dates are <code>2015-03-21</code> or <code>21/03/2015</code>.
        </li>
        <li>
          Optional: Student Phone, Class (must match a class name exactly), Entry Level (hadda or sauka), Medical Notes
          and the Guardian columns. Everyone imported is <strong>active</strong>; status, admitted-on date, Arabic name and
          notes are set later in the student form.
        </li>
        <li>
          Format the Admission No. column as <strong>Text</strong> in Excel, or numbers like <code>001</code> lose their zeros.
        </li>
        <li>Check the file first. Nothing is saved until every row is valid, and existing students are never changed.</li>
      </ol>

      <div className="mt-6">
        <ImportForm />
      </div>
    </div>
  );
}
