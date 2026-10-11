import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";
import { logout } from "@/app/login/actions";
import type { Profile } from "@/lib/auth";
import { menuFor } from "./portal-menu";

export function PortalHeader({ profile }: { profile: Profile }) {
  const menu = menuFor(profile);

  return (
    <header className="sticky top-0 z-40 border-b-4 border-b-gold bg-deep text-white print:hidden">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href={menu[0].href} className="flex min-w-0 items-center gap-3">
          <Image src="/logo.svg" alt="" width={40} height={40} priority className="size-10 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{profile.full_name}</span>
            <span className="block text-xs capitalize text-white/70">
              {profile.role}
              {profile.is_owner && " · owner"}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <form action={logout}>
            <button className="h-10 rounded-lg border border-white/40 px-3 text-sm hover:bg-white/10">
              Log out
            </button>
          </form>

          {/* Mobile menu: native <details>, no JavaScript needed */}
          <MobileMenu>
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-white/40 text-lg hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              <span aria-label="Menu" className="group-open:hidden">☰</span>
              <span aria-label="Close menu" className="hidden group-open:inline">✕</span>
            </summary>
            <nav className="absolute end-0 top-12 flex max-h-[75vh] w-60 flex-col gap-0.5 overflow-y-auto rounded-xl border bg-card p-2 text-foreground shadow-xl">
              <MenuLinks menu={menu} variant="menu" />
              <Link href="/" className="mt-1 rounded-lg border-t px-3 py-2.5 text-muted-foreground hover:bg-muted">
                Public website
              </Link>
            </nav>
          </MobileMenu>
        </div>
      </div>

      {/* Desktop menu */}
      <nav className="hidden border-t border-white/10 bg-black/15 md:block">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4 py-2 text-sm">
          <MenuLinks menu={menu} variant="pill" />
        </div>
      </nav>
    </header>
  );
}

function MenuLinks({ menu, variant }: { menu: ReturnType<typeof menuFor>; variant: "menu" | "pill" }) {
  return menu.map((m) =>
    m.soon ? (
      <span key={m.href} className="cursor-default rounded-lg px-3 py-2 text-white/40">
        {m.label}
      </span>
    ) : (
      <NavLink key={m.href} href={m.href} variant={variant}>
        {m.label}
      </NavLink>
    ),
  );
}
