import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";
import { navLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-t-4 border-t-primary bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="" width={44} height={44} loading="eager" className="size-11" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-primary">Madrasatu Hajiya Hindatu</span>
            <span lang="ar" dir="rtl" className="font-arabic text-xs text-muted-foreground">
              مدرسة الحاجة هندة
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((l) => (
            <NavLink key={l.href} href={l.href} variant="bar">
              {l.label}
            </NavLink>
          ))}
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Login
          </Link>
        </nav>

        {/* Mobile menu: native <details>, no JavaScript needed */}
        <MobileMenu>
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border bg-card text-lg [&::-webkit-details-marker]:hidden">
            <span aria-label="Menu" className="group-open:hidden">☰</span>
            <span aria-label="Close menu" className="hidden group-open:inline">✕</span>
          </summary>
          <nav className="absolute end-0 top-12 flex w-60 flex-col gap-0.5 rounded-xl border bg-card p-2 shadow-xl">
            {navLinks.map((l) => (
              <NavLink key={l.href} href={l.href} variant="menu">
                {l.label}
              </NavLink>
            ))}
            <Link
              href="/login"
              className="mt-1 rounded-lg bg-primary px-3 py-2.5 text-center font-medium text-primary-foreground"
            >
              Login
            </Link>
          </nav>
        </MobileMenu>
      </div>
    </header>
  );
}
