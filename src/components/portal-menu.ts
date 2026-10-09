import type { Profile } from "@/lib/auth";

// One list drives the header menu and the dashboard shortcuts.
// `soon: true` = page not built yet (shown greyed out). Remove the flag when its task lands.
type MenuItem = { href: string; label: string; staffOnly?: boolean; soon?: boolean };

const items: MenuItem[] = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/academic", label: "Academic setup", staffOnly: true },
  { href: "/portal/classes", label: "My classes" },
  { href: "/portal/students", label: "Students", staffOnly: true },
  { href: "/portal/applications", label: "Applications", staffOnly: true },
  { href: "/portal/messages", label: "Messages", staffOnly: true },
  { href: "/portal/fees", label: "Fees", staffOnly: true },
  { href: "/portal/posts", label: "News posts", staffOnly: true, soon: true }, // 4.1
  { href: "/portal/documents", label: "Documents", soon: true }, // 4.2
  { href: "/portal/accounts", label: "Accounts", staffOnly: true },
  { href: "/portal/settings", label: "Settings", staffOnly: true, soon: true }, // 4.7
];

export function menuFor(profile: Profile) {
  return items.filter((i) => !i.staffOnly || profile.role === "staff");
}
