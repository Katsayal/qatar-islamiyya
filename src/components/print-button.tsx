"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
      Print / Save as PDF
    </button>
  );
}
