import Link from "next/link";
import { navLinks } from "./nav-links";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 text-sm md:grid-cols-3">
        <div>
          <p className="font-semibold">Madrasatu Hajiya Hindatu</p>
          <p lang="ar" dir="rtl" className="font-arabic text-muted-foreground">
            مدرسة الحاجة هندة (قطر دورا)
          </p>
          <p className="mt-2 text-muted-foreground">Qatar Multi-Purpose Centre</p>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <p className="mt-1 text-muted-foreground">Zango Road, Daura, Katsina State, Nigeria</p>
          <p className="mt-1 text-muted-foreground">
            08038102495 · 09060456171 · 07038782451
          </p>
        </div>
        <div>
          <p className="font-semibold">Links</p>
          <ul className="mt-1 grid grid-cols-2 gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted-foreground hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t py-3 text-center text-xs text-muted-foreground">
        © Madrasatu Hajiya Hindatu
      </p>
    </footer>
  );
}
