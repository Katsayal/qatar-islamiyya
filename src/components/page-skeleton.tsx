// Grey pulsing placeholders shown instantly while data loads.
// PageSkeleton: whole portal pages (loading.tsx files). The others: Suspense fallbacks on the public site.

function Busy({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" className={`animate-pulse ${className}`}>
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

const bar = "rounded bg-muted";

export function PageSkeleton() {
  return (
    <Busy>
      <div className={`h-7 w-48 max-w-full ${bar}`} />
      <div className={`mt-2 h-4 w-64 max-w-full ${bar}`} />
      <ul className="mt-6 grid gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="rounded-lg border p-4">
            <div className={`h-4 w-2/3 ${bar}`} />
            <div className={`mt-2 h-3 w-1/3 ${bar}`} />
          </li>
        ))}
      </ul>
    </Busy>
  );
}

// News cards: optional cover image, title and date (grid classes come from the real list).
export function CardsSkeleton({ count, grid, image = false }: { count: number; grid: string; image?: boolean }) {
  return (
    <Busy className={`grid gap-4 ${grid}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border">
          {image && <div className="aspect-video w-full bg-muted" />}
          <div className="p-4">
            <div className={`h-4 w-3/4 ${bar}`} />
            <div className={`mt-2 h-3 w-1/3 ${bar}`} />
          </div>
        </div>
      ))}
    </Busy>
  );
}

// Gallery: square photo tiles, same grid as the real gallery.
export function PhotosSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Busy className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-square w-full rounded-lg bg-muted" />
      ))}
    </Busy>
  );
}

// One news post: cover, title, date, a few lines of text.
export function ArticleSkeleton() {
  return (
    <Busy>
      <div className="aspect-video w-full rounded-lg bg-muted" />
      <div className={`mt-4 h-8 w-3/4 ${bar}`} />
      <div className={`mt-2 h-4 w-32 ${bar}`} />
      {["w-full", "w-full", "w-5/6", "w-full", "w-2/3"].map((w, i) => (
        <div key={i} className={`mt-3 h-4 ${w} ${bar}`} />
      ))}
    </Busy>
  );
}

// A few short lines (e.g. bank details).
export function LinesSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Busy className="grid gap-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`h-4 ${i % 2 ? "w-40" : "w-56"} max-w-full ${bar}`} />
      ))}
    </Busy>
  );
}
