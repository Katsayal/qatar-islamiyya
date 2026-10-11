import Image from "next/image";
import Link from "next/link";
import { navLinks } from "./nav-links";

export function SiteFooter() {
  return (
    <footer className="pattern-star border-t-4 border-t-gold bg-deep text-primary-foreground">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <Image src="/logo.svg" alt="" width={56} height={56} className="size-14" />
          <p className="mt-3 font-semibold">Madrasatu Hajiya Hindatu</p>
          <p lang="ar" dir="rtl" className="font-arabic text-left text-primary-foreground/80">
            مدرسة الحاجة هندة (قطر دورا)
          </p>
          <p className="mt-1 text-primary-foreground/70">Qatar Multi-Purpose Centre</p>
        </div>
        <div>
          <p className="font-semibold text-gold">Contact</p>
          <p className="mt-2 text-primary-foreground/80">Zango Road, Daura, Katsina State, Nigeria</p>
          <p className="mt-2 text-primary-foreground/80">
            08038102495 · 09060456171 · 07038782451
          </p>
        </div>
        <div>
          <p className="font-semibold text-gold">Links</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-primary-foreground/80 hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-primary-foreground/60">
        © Madrasatu Hajiya Hindatu
      </p>
    </footer>
  );
}
