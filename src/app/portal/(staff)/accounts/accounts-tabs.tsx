import Link from "next/link";

// Two tabs at the top of both Accounts pages (staff and owner).
export function AccountsTabs({ active }: { active: "students" | "staff" }) {
  const tab = (on: boolean) =>
    `flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-medium ${on ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`;
  return (
    <nav className="mb-4 flex gap-2">
      <Link href="/portal/accounts" className={tab(active === "students")}>
        Student logins
      </Link>
      <Link href="/portal/accounts/staff" className={tab(active === "staff")}>
        Teachers &amp; staff
      </Link>
    </nav>
  );
}
