"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { resizeImage } from "@/lib/resize-image";
import { uploadProof } from "./actions";
import { controlClass, fileInputClass } from "@/components/form-parts";

const input = controlClass;

export function ProofForm({ terms, defaultTerm }: { terms: { id: string; label: string }[]; defaultTerm: string }) {
  const [result, formAction, pending] = useActionState(uploadProof, null);
  const [preparing, setPreparing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the chosen file after a successful upload; after an error the form keeps its values.
  useEffect(() => {
    if (result?.ok) formRef.current?.reset();
  }, [result]);

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const file = form.get("proof");
        if (!(file instanceof File) || file.size === 0) return;
        setPreparing(true);
        // Photos are shrunk to fit the limit; PDFs are sent as they are.
        const data = new FormData();
        data.set("term_id", String(form.get("term_id")));
        data.set("proof", file.type.startsWith("image/") ? await resizeImage(file) : file);
        setPreparing(false);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Which term did you pay for?
        <select name="term_id" defaultValue={defaultTerm} className={input}>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Receipt or transfer screenshot
        <input name="proof" type="file" required accept="image/jpeg,image/png,image/webp,application/pdf" className={fileInputClass} />
        <span className="text-xs font-normal text-muted-foreground">JPG, PNG, WebP or PDF, up to 2 MB.</span>
      </label>
      {result && (
        <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending || preparing} className="h-12 rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {preparing ? "Preparing…" : pending ? "Sending…" : "Send proof of payment"}
      </button>
    </form>
  );
}
