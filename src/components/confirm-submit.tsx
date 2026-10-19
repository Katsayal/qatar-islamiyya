"use client";

import { useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { btn } from "@/components/buttons";
import { cn } from "@/lib/utils";

// A submit button with an "Are you sure?" step on the page. Use it instead of window.confirm,
// which some browsers (e.g. in-app ones) cancel without showing anything.
// The first press shows the question with "Yes" and "Cancel"; "Yes" submits the surrounding form,
// so the form's own onSubmit / action runs as before. `ask` may read the form (counts, choices);
// returning null submits straight away (nothing to confirm).
export function ConfirmSubmit({
  ask,
  yes,
  tone = "danger",
  compact = false,
  className,
  disabled,
  label,
  children,
}: {
  ask: string | ((form: HTMLFormElement) => string | null);
  /** Text of the confirming button, e.g. "Yes, delete". */
  yes: string;
  /** danger = red "Yes" (deletes), save = green "Yes" (moves, changes). */
  tone?: "danger" | "save";
  /** Smaller buttons, for a row in a list. */
  compact?: boolean;
  /** Classes of the first button (usually a btn.* look). */
  className: string;
  disabled?: boolean;
  /** aria-label of the first button, when its text alone is not clear. */
  label?: string;
  children: ReactNode;
}) {
  const [question, setQuestion] = useState<string | null>(null);
  const size = compact ? "h-9 px-3 text-xs" : "";

  if (question === null) {
    return (
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        className={className}
        onClick={(e) => {
          const form = e.currentTarget.form;
          if (!form) return;
          const q = typeof ask === "function" ? ask(form) : ask;
          if (q === null) form.requestSubmit();
          else setQuestion(q);
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label={question} className={cn("flex flex-col gap-2 rounded-lg border border-gold/60 bg-gold/15 p-3", compact ? "text-xs" : "text-sm")}>
      <p>{question}</p>
      <div className="flex gap-2">
        <button
          type="button"
          className={cn(tone === "danger" ? btn.dangerSolid : btn.save, size, "flex-1")}
          onClick={(e) => {
            const form = e.currentTarget.form;
            setQuestion(null);
            form?.requestSubmit();
          }}
        >
          <Check aria-hidden /> {yes}
        </button>
        <button type="button" autoFocus className={cn(btn.secondary, size, "flex-1")} onClick={() => setQuestion(null)}>
          <X aria-hidden /> Cancel
        </button>
      </div>
    </div>
  );
}
