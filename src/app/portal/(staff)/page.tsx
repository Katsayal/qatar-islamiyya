import Link from "next/link";
import { Suspense } from "react";
import { DashboardFees } from "@/components/dashboard-fees";
import { DashboardPace } from "@/components/dashboard-pace";
import { DashboardTotals } from "@/components/dashboard-totals";
import { requireRole } from "@/lib/auth";
import { menuFor } from "@/components/portal-menu";

const loading = <p className="text-sm text-muted-foreground">Loading…</p>;

// Greeting, staff-only totals, and shortcuts to every page.
export default async function PortalHome() {
  const profile = await requireRole("teacher", "staff");
  const shortcuts = menuFor(profile).filter((m) => m.href !== "/portal");

  return (
    <div>
      <h1 className="text-xl font-semibold">Assalamu alaykum, {profile.full_name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {profile.role === "staff" ? "Staff portal" : "Teacher portal"}
      </p>

      {profile.role === "staff" && (
        <div className="mt-6 flex flex-col gap-8">
          <Suspense fallback={loading}>
            <DashboardTotals />
          </Suspense>
          <Suspense fallback={loading}>
            <DashboardFees />
          </Suspense>
          <Suspense fallback={loading}>
            <DashboardPace />
          </Suspense>
        </div>
      )}

      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {shortcuts.map((s) => (
          <li key={s.href}>
            {s.soon ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {s.label}
                <span className="block text-xs">Coming soon</span>
              </div>
            ) : (
              <Link href={s.href} className="block rounded-lg border p-4 text-sm font-medium hover:bg-muted">
                {s.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
