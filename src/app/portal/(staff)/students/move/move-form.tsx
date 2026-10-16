"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRightLeft, FileSearch } from "lucide-react";
import { btn } from "@/components/buttons";
import { fileInputClass } from "@/components/form-parts";
import { applyMoves, checkMoves, type MoveReport } from "./actions";

export function MoveForm() {
  const [text, setText] = useState<string | null>(null);
  const [report, setReport] = useState<MoveReport | null>(null);
  const [done, setDone] = useState<{ moved: number; error: string | null } | null>(null);
  const [pending, start] = useTransition();

  async function onFile(file: File | undefined) {
    setReport(null);
    setDone(null);
    setText(file ? await file.text() : null);
  }

  if (done && !done.error) {
    return (
      <p role="status" className="rounded-xl border bg-muted p-4">
        Moved {done.moved} student{done.moved === 1 ? "" : "s"}.{" "}
        <Link href="/portal/students" className="text-primary underline-offset-4 hover:underline">
          See the list
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} className={fileInputClass} />
      <button
        disabled={!text || pending}
        onClick={() => text && start(async () => setReport(await checkMoves(text)))}
        className={btn.secondary}
      >
        <FileSearch aria-hidden /> {pending && !report ? "Checking…" : "Check file"}
      </button>

      {report && (
        <div className="rounded-xl border bg-card p-4 text-sm shadow-sm">
          <p className="font-medium">
            {report.rowCount} row{report.rowCount === 1 ? "" : "s"} read,{" "}
            {report.errors.length ? `${report.errors.length} problem${report.errors.length === 1 ? "" : "s"}` : "no problems"}
          </p>
          {report.errors.length > 0 ? (
            <>
              <ul className="mt-2 max-h-64 list-disc space-y-1 overflow-y-auto ps-5 text-destructive">
                {report.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <p className="mt-2 text-muted-foreground">Nothing is moved until every row is valid. Fix the file and check it again.</p>
            </>
          ) : (
            <>
              <p className="mt-1">
                {report.toMove} student{report.toMove === 1 ? "" : "s"} will move
                {report.unchanged > 0 && `, ${report.unchanged} already in that class`}.
              </p>
              {report.toMove > 0 && text && (
                <button disabled={pending} onClick={() => start(async () => setDone(await applyMoves(text)))} className={`${btn.save} mt-3`}>
                  <ArrowRightLeft aria-hidden /> {pending ? "Moving…" : `Move ${report.toMove} student${report.toMove === 1 ? "" : "s"}`}
                </button>
              )}
            </>
          )}
          {done?.error && <p role="alert" className="mt-2 text-destructive">{done.error}</p>}
        </div>
      )}
    </div>
  );
}
