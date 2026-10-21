"use client";

import { Trash2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { btn } from "@/components/buttons";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { gregorianDate, hausaWeekday } from "@/lib/hijri";
import { deleteHijriOffset } from "./actions";
import { Message } from "./message";

const shiftText = (d: number) => (d === 0 ? "no shift" : `${d > 0 ? "+" : "−"}${Math.abs(d)} day${Math.abs(d) > 1 ? "s" : ""}`);

// Past offset changes, newest first, each with Delete (for mistakes; the activity log keeps the history).
export function HijriChanges({ changes }: { changes: { id: string; starts_on: string; days: number }[] }) {
  const [result, deleteAction, deleting] = useActionState(deleteHijriOffset, null);

  return (
    <div className="flex flex-col gap-2">
      {changes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No changes yet: every date is shown as Umm al-Qura.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {changes.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span>
                From {hausaWeekday(c.starts_on)}, {gregorianDate(c.starts_on, "en", "medium")} · <b>{shiftText(c.days)}</b>
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  startTransition(() => deleteAction(new FormData(e.currentTarget)));
                }}
              >
                <input type="hidden" name="id" value={c.id} />
                <ConfirmSubmit
                  ask={`Delete the change from ${gregorianDate(c.starts_on, "en", "medium")}?`}
                  yes="Yes, delete"
                  compact
                  disabled={deleting}
                  label={`Delete the change from ${gregorianDate(c.starts_on, "en", "medium")}`}
                  className={`${btn.danger} h-9 px-3 text-xs`}
                >
                  <Trash2 aria-hidden /> Delete
                </ConfirmSubmit>
              </form>
            </li>
          ))}
        </ul>
      )}
      {/* Outside the list so the message stays after the deleted row disappears. */}
      <Message result={result} />
    </div>
  );
}
