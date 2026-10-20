import type { ui } from "@/content/ui";

// Header and footer menu: the path and the key of its label in ui.ts (nav), so each language has its own words.
export const navLinks: { href: string; key: keyof (typeof ui)["en"]["nav"] }[] = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/programs", key: "programs" },
  { href: "/admissions", key: "admissions" },
  { href: "/news", key: "news" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
];
