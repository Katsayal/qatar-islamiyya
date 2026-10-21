import { ChevronDown } from "lucide-react";

// A card that is closed by default and opens on a tap (plain <details>, no JavaScript).
// Used by the staff dashboard so long lists stay out of the way until asked for.
export function Collapsible({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group mt-3 rounded-xl border bg-card text-sm shadow-sm">
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t">{children}</div>
    </details>
  );
}
