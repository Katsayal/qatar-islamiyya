"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { resizeImage } from "@/lib/resize-image";
import { uploadPhotos } from "./actions";
import { controlClass } from "@/components/form-parts";

export function UploadForm() {
  const [result, formAction, pending] = useActionState(uploadPhotos, null);
  const [resizing, setResizing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the chosen photos only after a successful upload; after an error the form keeps its values.
  useEffect(() => {
    if (result?.ok) formRef.current?.reset();
  }, [result]);

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault();
        const input = new FormData(e.currentTarget);
        const data = new FormData();
        data.set("caption", String(input.get("caption") ?? ""));
        setResizing(true);
        for (const file of input.getAll("photos")) {
          if (file instanceof File && file.size > 0) data.append("photos", await resizeImage(file));
        }
        setResizing(false);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-3 rounded-xl border p-4 bg-card shadow-sm"
    >
      <label className="flex flex-col gap-1 text-sm">
        Photos (up to 10)
        <input name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp" required className="text-sm" />
        <span className="text-xs text-muted-foreground">Large photos are made smaller automatically.</span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Caption for these photos (optional)
        <input name="caption" maxLength={150} className={controlClass} />
      </label>
      {result && (
        <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={pending || resizing} className="h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90">
        {resizing ? "Preparing…" : pending ? "Uploading…" : "Upload photos"}
      </button>
    </form>
  );
}
