"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

type Props = { href: string; variant: "bar" | "menu"; children: React.ReactNode };

// A header link that knows if it is the current page (gold underline on desktop, tint on phone).
// usePathname() needs <Suspense> (Cache Components): the plain link is prerendered, the highlight streams in.
export function NavLink(props: Props) {
  return (
    <Suspense fallback={<StyledLink {...props} active={false} />}>
      <ActiveLink {...props} />
    </Suspense>
  );
}

function ActiveLink(props: Props) {
  const pathname = usePathname();
  const active = props.href === "/" ? pathname === "/" : pathname.startsWith(props.href);
  return <StyledLink {...props} active={active} />;
}

function StyledLink({ href, variant, children, active }: Props & { active: boolean }) {
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
