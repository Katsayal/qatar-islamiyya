"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A header link that knows if it is the current page (gold underline on desktop, tint on phone).
export function NavLink({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "bar" | "menu";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (variant === "bar") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`border-b-2 py-1 transition-colors hover:text-primary ${
          active ? "border-gold font-medium text-primary" : "border-transparent"
        }`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-2.5 ${
        active ? "bg-secondary font-medium text-primary" : "hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
