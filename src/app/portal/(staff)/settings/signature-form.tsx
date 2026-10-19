"use client";

import Image from "next/image";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { resizeImage } from "@/lib/resize-image";
import { cn } from "@/lib/utils";
import { big, btn } from "@/components/buttons";
import { fileInputClass } from "@/components/form-parts";
import { removeSignature, uploadSignature } from "./actions";

function Message({ result }: { result: { ok: boolean; message: string } | null }) {
  if (!result) return null;
  return (
    <p role="alert" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-primary/30 bg-secondary text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
      {result.message}
    </p>
  );
}

export function SignatureForm({ currentUrl }: { currentUrl: string | null }) {
  const [uploadResult, uploadAction, uploading] = useActionState(uploadSignature, null);
  const [removeResult, removeAction, removing] = useActionState(removeSignature, null);
  const [preparing, setPreparing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the chosen file only after a successful upload; after an error the form keeps its values.
  useEffect(() => {
    if (uploadResult?.ok) formRef.current?.reset();
  }, [uploadResult]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-24 items-center justify-center rounded-xl border bg-background p-2">
        {currentUrl ? (
          <Image src={currentUrl} alt="Director's signature" width={240} height={80} unoptimized className="max-h-20 w-auto object-contain" />
        ) : (
          <p className="text-sm text-muted-foreground">No signature uploaded yet.</p>
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={async (e) => {
          e.preventDefault();
          const file = new FormData(e.currentTarget).get("signature");
          if (!(file instanceof File) || file.size === 0) return;
          setPreparing(true);
          const data = new FormData();
          data.set("signature", await resizeImage(file, 800));
          setPreparing(false);
          startTransition(() => uploadAction(data));
        }}
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm">
          {currentUrl ? "Replace signature" : "Upload signature"}
          <input name="signature" type="file" required accept="image/jpeg,image/png,image/webp" className={fileInputClass} />
          <span className="text-xs text-muted-foreground">A photo or scan of the signature on white paper. JPG, PNG or WebP.</span>
        </label>
        <Message result={uploadResult} />
        <button disabled={uploading || preparing} className={cn(btn.upload, big)}>
          <Upload aria-hidden /> {preparing ? "Preparing…" : uploading ? "Uploading…" : "Upload signature"}
        </button>
      </form>

      {currentUrl && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => removeAction());
          }}
        >
          <ConfirmSubmit ask="Remove the signature from report cards?" yes="Yes, remove" disabled={removing} className={`${btn.danger} w-full`}>
            <Trash2 aria-hidden /> {removing ? "Removing…" : "Remove signature"}
          </ConfirmSubmit>
        </form>
      )}
      {/* Outside the conditional so the message stays after the form disappears. */}
      <Message result={removeResult} />
    </div>
  );
}
