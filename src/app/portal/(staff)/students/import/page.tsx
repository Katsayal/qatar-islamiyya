import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ImportForm } from "./import-form";

export default async function ImportPage() {
  await requireRole("staff");

  return (
    <div className="max-w-xl">
      <Link href="/portal/students" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Students
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Import students (CSV)</h1>

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
          Required: <strong>admission_no</strong>, <strong>full_name</strong>, <strong>gender</strong> (male or female).
          Dates are <code>2015-03-21</code> or <code>21/03/2015</code>. The <strong>class</strong> must match a class name exactly.
        </li>
        <li>
          Format the admission_no column as <strong>Text</strong> in Excel, or numbers like <code>001</code> lose their zeros.
        </li>
        <li>Check the file first. Nothing is saved until every row is valid, and existing students are never changed.</li>
      </ol>

      <div className="mt-6">
        <ImportForm />
      </div>
    </div>
  );
}
