import type { Profile } from "@/lib/auth";

// One list drives the header menu and the dashboard shortcuts.
// `soon: true` = page not built yet (shown greyed out). Remove the flag when its task lands.
type MenuItem = { href: string; label: string; staffOnly?: boolean; soon?: boolean };

const items: MenuItem[] = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/academic", label: "Academic setup", staffOnly: true },
  { href: "/portal/classes", label: "My classes" },
  { href: "/portal/books", label: "Books & exams" },
  { href: "/portal/students", label: "Students", staffOnly: true },
  { href: "/portal/applications", label: "Applications", staffOnly: true },
  { href: "/portal/messages", label: "Messages", staffOnly: true },
  { href: "/portal/fees", label: "Fees", staffOnly: true },
  { href: "/portal/reports", label: "Report cards", staffOnly: true },
  { href: "/portal/promotion", label: "Promotion", staffOnly: true },
  { href: "/portal/news", label: "News" },
  { href: "/portal/posts", label: "Manage news", staffOnly: true },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/gallery", label: "Gallery", staffOnly: true },
  { href: "/portal/accounts", label: "Accounts", staffOnly: true },
  { href: "/portal/settings", label: "Settings", staffOnly: true },
];

// Students have their own short list; more items arrive with 5.2–5.5.
const studentItems: MenuItem[] = [
  { href: "/portal/student", label: "Dashboard" },
  { href: "/portal/student/hifz", label: "Hifz" },
  { href: "/portal/student/barnamaj", label: "Barnamaj" },
  { href: "/portal/student/report-cards", label: "Report card" },
  { href: "/portal/student/fees", label: "Fees" },
  { href: "/portal/student/news", label: "News" },
  { href: "/portal/student/resources", label: "Resources" },
  { href: "/portal/student/profile", label: "Profile" },
];

export function menuFor(profile: Profile) {
  if (profile.role === "student") return studentItems;
  return items.filter((i) => !i.staffOnly || profile.role === "staff");
}
