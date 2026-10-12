import Link from "next/link";

// Two (or more) tabs at the top of a section with sub-pages: Accounts (Student logins | Teachers & staff),
// Academic setup (Academic years | Classes). The active tab is solid green.
export function PageTabs({ tabs, active }: { tabs: { href: string; label: string }[]; active: string }) {
  const tab = (on: boolean) =>
    `flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-medium ${on ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`;
  return (
    <nav className="mb-4 flex gap-2">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} aria-current={t.href === active ? "page" : undefined} className={tab(t.href === active)}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

export const accountTabs = [
  { href: "/portal/accounts", label: "Student logins" },
  { href: "/portal/accounts/staff", label: "Teachers & staff" },
];

export const academicTabs = [
  { href: "/portal/academic", label: "Academic years" },
  { href: "/portal/academic/classes", label: "Classes" },
];
