import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { PortalHeader } from "@/components/portal-header";

// Session read must sit behind <Suspense> (Cache Components).
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-muted-foreground">Loading…</p>}>
      <StudentShell>{children}</StudentShell>
    </Suspense>
  );
}

async function StudentShell({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("student");
  return (
    <>
      <PortalHeader profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
