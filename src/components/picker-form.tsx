"use client";

import Form from "next/form";

// A picker or filter bar that applies as soon as a dropdown/date changes: no "Go" or "Filter" button.
// Typing in a text/search box does not submit; Enter does (so a search runs once, not per letter).
// next/form makes the GET submit a client navigation (loading skeleton, no full reload).
// The hidden button keeps it usable with a keyboard (Enter) or without JavaScript.
export function PickerForm({
  action,
  className,
  children,
}: {
  action: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Form
      action={action}
      className={className}
      onChange={(e) => {
        const t = e.target as unknown as HTMLInputElement; // the field that changed (change events bubble)
        if (t.type === "text" || t.type === "search") return;
        e.currentTarget.requestSubmit();
      }}
    >
      {children}
      <button type="submit" className="sr-only">
        Show
      </button>
    </Form>
  );
}
