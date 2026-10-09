import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { navLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-primary">Madrasatu Hajiya Hindatu</span>
          <span lang="ar" dir="rtl" className="font-arabic text-xs text-muted-foreground">
            مدرسة الحاجة هندة
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-primary">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">
            Login
          </Link>
        </nav>

        {/* Mobile menu: native <details>, no JavaScript needed */}
        <MobileMenu>
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border text-lg [&::-webkit-details-marker]:hidden">
            <span aria-label="Menu" className="group-open:hidden">☰</span>
            <span aria-label="Close menu" className="hidden group-open:inline">✕</span>
          </summary>
          <nav className="absolute end-0 top-12 flex w-56 flex-col rounded-md border bg-background p-2 shadow-lg">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="rounded px-3 py-2.5 hover:bg-muted">
                {l.label}
              </Link>
            ))}
            <Link href="/login" className="mt-1 rounded bg-primary px-3 py-2.5 text-center text-primary-foreground">
              Login
            </Link>
          </nav>
        </MobileMenu>
      </div>
    </header>
  );
}
