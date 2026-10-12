"use client";

import Form from "next/form";

// A one-field picker (term, date) that loads as soon as the value changes: no "Go" button.
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
    <Form action={action} className={className} onChange={(e) => e.currentTarget.requestSubmit()}>
      {children}
      <button type="submit" className="sr-only">
        Show
      </button>
    </Form>
  );
}
