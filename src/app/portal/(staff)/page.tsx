import Link from "next/link";
import { Suspense } from "react";
import { DashboardFees } from "@/components/dashboard-fees";
import { DashboardPace } from "@/components/dashboard-pace";
import { DashboardTotals } from "@/components/dashboard-totals";
import { requireRole } from "@/lib/auth";
import { PortalBanner } from "@/components/portal-banner";
import { menuFor } from "@/components/portal-menu";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const loading = <p className="text-sm text-muted-foreground">Loading…</p>;

// Greeting, staff-only totals, and shortcuts to every page.
export default async function PortalHome() {
  const profile = await requireRole("teacher", "staff");
  const shortcuts = menuFor(profile).filter((m) => m.href !== "/portal");

  return (
    <div>
      <PortalBanner
        title={`Assalamu alaykum, ${profile.full_name}`}
        subtitle={profile.role === "staff" ? "Staff portal" : "Teacher portal"}
      />

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

      <h2 className="mt-8 text-lg font-semibold">Quick links</h2>
      <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {shortcuts.map((s) => (
          <li key={s.href}>
            {s.soon ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                {s.label}
                <span className="block text-xs">Coming soon</span>
              </div>
            ) : (
              <Link
                href={s.href}
                className="flex items-center justify-between gap-2 rounded-xl border bg-card p-4 text-sm font-medium shadow-sm transition-colors hover:border-primary hover:bg-secondary"
              >
                {s.label}
                <span aria-hidden className="text-gold">→</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
