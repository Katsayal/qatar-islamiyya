import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// A card that is closed by default and opens on a tap (plain <details>, no JavaScript).
// Used by the staff dashboard, Classes and Gallery so long lists stay out of the way until asked for.
export function Collapsible({ title, children, className }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <details className={cn("group mt-3 rounded-xl border bg-card text-sm shadow-sm", className)}>
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t">{children}</div>
    </details>
  );
}
