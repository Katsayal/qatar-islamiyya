"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { browserPath } from "@/lib/lang";

// bar = public header (gold underline), menu = phone menu card (tint), pill = portal bar on dark green.
type Props = { href: string; variant: "bar" | "menu" | "pill"; children: React.ReactNode };

// These links are "home" pages: only an exact match counts (everything else starts with them).
const exactOnly = ["/", "/ar", "/portal", "/portal/student"];

// A header link that knows if it is the current page.
// usePathname() needs <Suspense> (Cache Components): the plain link is prerendered, the highlight streams in.
export function NavLink(props: Props) {
  return (
    <Suspense fallback={<StyledLink {...props} active={false} />}>
      <ActiveLink {...props} />
    </Suspense>
  );
}

function ActiveLink(props: Props) {
  const pathname = browserPath(usePathname());
  const active =
    pathname === props.href || (!exactOnly.includes(props.href) && pathname.startsWith(`${props.href}/`));
  return <StyledLink {...props} active={active} />;
}

function StyledLink({ href, variant, children, active }: Props & { active: boolean }) {
  const current = active ? "page" : undefined;

  if (variant === "bar") {
    return (
      <Link
        href={href}
        aria-current={current}
        className={`border-b-2 py-1 transition-colors hover:text-primary ${
          active ? "border-gold font-medium text-primary" : "border-transparent"
        }`}
      >
        {children}
      </Link>
    );
  }
  if (variant === "pill") {
    return (
      <Link
        href={href}
        aria-current={current}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          active ? "bg-gold font-medium text-deep" : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      aria-current={current}
      className={`rounded-lg px-3 py-2.5 ${active ? "bg-secondary font-medium text-primary" : "hover:bg-muted"}`}
    >
      {children}
    </Link>
  );
}
