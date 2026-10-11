"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { checkCsv, importCsv, type Report } from "./actions";

const button = "h-11 rounded-lg px-5 text-sm font-medium disabled:opacity-50";

export function ImportForm() {
  const [text, setText] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [done, setDone] = useState<{ imported: number; error: string | null } | null>(null);
  const [pending, start] = useTransition();

  async function onFile(file: File | undefined) {
    setReport(null);
    setDone(null);
    setText(file ? await file.text() : null);
  }

  if (done && !done.error) {
    return (
      <p role="status" className="rounded-xl border bg-muted p-4">
        Imported {done.imported} student{done.imported === 1 ? "" : "s"}.{" "}
        <Link href="/portal/students" className="text-primary underline-offset-4 hover:underline">
          See the list
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
      <button
        disabled={!text || pending}
        onClick={() => text && start(async () => setReport(await checkCsv(text)))}
        className={`${button} border`}
      >
        {pending && !report ? "Checking…" : "Check file"}
      </button>

      {report && (
        <div className="rounded-xl border p-4 text-sm bg-card shadow-sm">
          <p className="font-medium">
            {report.rowCount} row{report.rowCount === 1 ? "" : "s"} read,{" "}
            {report.errors.length ? `${report.errors.length} problem${report.errors.length === 1 ? "" : "s"}` : "no problems"}
          </p>
          {report.errors.length > 0 && (
            <>
              <ul className="mt-2 max-h-64 list-disc space-y-1 overflow-y-auto ps-5 text-destructive">
                {report.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <p className="mt-2 text-muted-foreground">Nothing is imported until every row is valid. Fix the file and check it again.</p>
            </>
          )}
          {!report.errors.length && report.rowCount > 0 && text && (
            <button
              disabled={pending}
              onClick={() => start(async () => setDone(await importCsv(text)))}
              className={`${button} mt-3 bg-primary text-primary-foreground`}
            >
              {pending ? "Importing…" : `Import ${report.rowCount} student${report.rowCount === 1 ? "" : "s"}`}
            </button>
          )}
          {done?.error && <p role="alert" className="mt-2 text-destructive">{done.error}</p>}
        </div>
      )}
    </div>
  );
}
