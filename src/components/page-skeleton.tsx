// Grey placeholder bars shown instantly while a portal page loads its data (used by loading.tsx files).
export function PageSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <span className="sr-only">Loading…</span>
      <div className="h-7 w-48 max-w-full rounded bg-muted" />
      <div className="mt-2 h-4 w-64 max-w-full rounded bg-muted" />
      <ul className="mt-6 grid gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="rounded-lg border p-4">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
          </li>
        ))}
      </ul>
    </div>
  );
}
