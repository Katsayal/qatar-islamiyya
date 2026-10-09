import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { logout } from "@/app/login/actions";
import type { Profile } from "@/lib/auth";
import { menuFor } from "./portal-menu";

export function PortalHeader({ profile }: { profile: Profile }) {
  const menu = menuFor(profile);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{profile.full_name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {profile.role}
            {profile.is_owner && " · owner"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form action={logout}>
            <button className="h-10 rounded-md border px-3 text-sm hover:bg-muted">Log out</button>
          </form>

          {/* Mobile menu: native <details>, no JavaScript needed */}
          <MobileMenu>
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border text-lg [&::-webkit-details-marker]:hidden">
              <span aria-label="Menu" className="group-open:hidden">☰</span>
              <span aria-label="Close menu" className="hidden group-open:inline">✕</span>
            </summary>
            <nav className="absolute end-0 top-12 flex w-56 flex-col rounded-md border bg-background p-2 shadow-lg">
              <MenuLinks menu={menu} className="px-3 py-2.5" />
              <Link href="/" className="mt-1 rounded border-t px-3 py-2.5 text-muted-foreground hover:bg-muted">
                Public website
              </Link>
            </nav>
          </MobileMenu>
        </div>
      </div>

      {/* Desktop menu */}
      <nav className="hidden border-t md:block">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4 py-1 text-sm">
          <MenuLinks menu={menu} className="px-3 py-1.5" />
        </div>
      </nav>
    </header>
  );
}

function MenuLinks({ menu, className }: { menu: ReturnType<typeof menuFor>; className: string }) {
  return menu.map((m) =>
    m.soon ? (
      <span key={m.href} className={`${className} cursor-default rounded text-muted-foreground/60`}>
        {m.label}
      </span>
    ) : (
      <Link key={m.href} href={m.href} className={`${className} rounded hover:bg-muted`}>
        {m.label}
      </Link>
    ),
  );
}
