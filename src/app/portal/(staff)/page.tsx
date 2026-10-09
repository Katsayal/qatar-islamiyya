import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { menuFor } from "@/components/portal-menu";

// Placeholder dashboard: greeting + shortcuts. Real totals come in 4.5.
export default async function PortalHome() {
  const profile = await requireRole("teacher", "staff");
  const shortcuts = menuFor(profile).filter((m) => m.href !== "/portal");

  return (
    <div>
      <h1 className="text-xl font-semibold">Assalamu alaykum, {profile.full_name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {profile.role === "staff" ? "Staff portal" : "Teacher portal"}
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
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
