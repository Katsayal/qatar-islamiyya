"use client";

import { useState } from "react";
import { resizeImage } from "@/lib/resize-image";
import { refreshGallery, uploadPhoto, type Result } from "./actions";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { controlClass, Field, fileInputClass } from "@/components/form-parts";

const MAX_FILES = 10;

export function UploadForm() {
  const [result, setResult] = useState<Result>(null);
  const [busy, setBusy] = useState<string | null>(null); // "Preparing…" / "Uploading 3 of 10…"
  const [chosen, setChosen] = useState<string[]>([]);

  async function upload(form: HTMLFormElement) {
    const input = new FormData(form);
    const caption = String(input.get("caption") ?? "");
    const files = input.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    setResult(null);
    if (files.length === 0) return setResult({ ok: false, message: "Please choose at least one photo." });
    if (files.length > MAX_FILES) return setResult({ ok: false, message: `Please upload at most ${MAX_FILES} photos at a time.` });

    // Shrink every photo first; resizeImage returns the same file when the browser cannot read it.
    setBusy("Preparing…");
    const ready: File[] = [];
    const unreadable: string[] = [];
    for (const file of files) {
      const small = await resizeImage(file);
      if (small === file) unreadable.push(file.name);
      else ready.push(small);
    }
    if (unreadable.length > 0) {
      setBusy(null);
      return setResult({ ok: false, message: `Could not read: ${unreadable.join(", ")}. Please choose JPG, PNG or WebP photos. Nothing was uploaded.` });
    }

    // One request per photo, so a big batch never hits the hosting time limit; the grid refreshes once at the end.
    for (const [i, file] of ready.entries()) {
      setBusy(`Uploading ${i + 1} of ${ready.length}…`);
      const data = new FormData();
      data.set("caption", caption);
      data.set("photo", file);
      const res = await uploadPhoto(data).catch(() => ({ ok: false, message: "The connection failed." }));
      if (!res.ok) {
        if (i > 0) await refreshGallery().catch(() => {});
        setBusy(null);
        return setResult({
          ok: false,
          message: `Uploaded ${i} of ${ready.length}. "${files[i].name}" was not uploaded: ${res.message} Choose the remaining photos and upload again.`,
        });
      }
    }
    setBusy("Finishing…");
    await refreshGallery().catch(() => {});
    setBusy(null);
    setResult({ ok: true, message: ready.length === 1 ? "Photo uploaded." : `${ready.length} photos uploaded.` });
    form.reset();
    setChosen([]);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        upload(e.currentTarget);
      }}
      className="flex flex-col gap-4 rounded-xl border p-4 bg-card shadow-sm"
    >
      <h2 className="font-semibold">Add photos</h2>
      <Field label="Photos (up to 10)">
        <input
          name="photos"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(e) => setChosen([...(e.currentTarget.files ?? [])].map((f) => f.name))}
          className={fileInputClass}
        />
        <span className="text-xs font-normal text-muted-foreground">
          To upload several photos, select them all at once in the picker (tap each photo on a phone; hold Ctrl or Shift on a computer).
          Choosing again replaces the earlier selection. JPG, PNG or WebP; large photos are made smaller automatically.
        </span>
      </Field>
      {chosen.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {chosen.length === 1 ? "1 photo chosen:" : `${chosen.length} photos chosen:`}
          </p>
          <ul className="mt-1 list-disc ps-5">
            {chosen.map((name, i) => (
              <li key={i} className="truncate">{name}</li>
            ))}
          </ul>
        </div>
      )}
      <Field label="Caption for these photos (optional)">
        <input name="caption" maxLength={150} className={`${controlClass} w-full`} />
      </Field>
      {result && (
        <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          {result.message}
        </p>
      )}
      <button disabled={busy !== null} className={cn(btn.upload, big)}>
        <Upload aria-hidden /> {busy ?? "Upload photos"}
      </button>
    </form>
  );
}
