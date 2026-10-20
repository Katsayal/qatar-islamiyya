import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { dirOf, hasLang, LANGS } from "@/lib/lang";

// Both languages are prerendered: /en/… (served at the plain URLs by the proxy) and /ar/….
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

// <html lang> stays "en" (one root layout for the whole app); the page language and direction are set here.
export default async function PublicLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLang(lang)) notFound();

  return (
    <div lang={lang} dir={dirOf(lang)} className={`flex flex-1 flex-col ${lang === "ar" ? "font-arabic-page" : ""}`}>
      <SiteHeader lang={lang} />
      <main className="flex-1">{children}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}
