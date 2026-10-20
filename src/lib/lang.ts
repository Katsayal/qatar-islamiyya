// The public site's two languages. English lives at the plain URLs (/about), Arabic under /ar (/ar/about).
// Internally every public page is app/[lang]/…; src/proxy.ts rewrites plain URLs to /en/… (see publicRoute).
export const LANGS = ["en", "ar"] as const;
export type Lang = (typeof LANGS)[number];

export const hasLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);

export const dirOf = (lang: Lang) => (lang === "ar" ? "rtl" : "ltr");

// The [lang] route param as a Lang (the [lang] layout already answers 404 for anything else).
export const toLang = (v: string): Lang => (hasLang(v) ? v : "en");

// usePathname() on an English page is "/en/about" while prerendering and "/about" in the browser (proxy rewrite):
// compare paths only after this, so server and browser agree (no hydration mismatch).
export const browserPath = (pathname: string) => pathname.replace(/^\/en(?=\/|$)/, "") || "/";

// A site path in the given language: ("ar", "/about") → "/ar/about", ("ar", "/") → "/ar", English unchanged.
export function href(lang: Lang, path: string) {
  if (lang === "en") return path;
  if (path === "/") return "/ar";
  if (path.startsWith("/#")) return `/ar${path.slice(1)}`;
  return `/ar${path}`;
}

// A date for the public pages. English as before ("19 Oct 2026" / "19 October 2026");
// Arabic always with the month name and Western digits ("19 أكتوبر 2026"): its "medium" style is all numbers.
export function formatDate(lang: Lang, iso: string, style: "medium" | "long") {
  const d = new Date(iso);
  return lang === "ar"
    ? d.toLocaleDateString("ar-u-nu-latn", { day: "numeric", month: "long", year: "numeric" })
    : d.toLocaleDateString("en-GB", { dateStyle: style });
}

// The language of a browser path, and the same page in the other language (for the header switch).
export function langOfPath(pathname: string): Lang {
  return pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
}

export function otherLangPath(pathname: string) {
  if (pathname === "/ar") return "/";
  if (pathname.startsWith("/ar/")) return pathname.slice(3);
  return href("ar", pathname);
}

// Paths that are not public pages: the portals, login, routes and files.
const NOT_PUBLIC = ["/portal", "/login", "/health", "/api", "/_next"];

// What the proxy does with a path:
// - rewrite: a plain public URL is served by the English page (/about → /en/about, the address bar keeps /about),
// - redirect: /en/… typed by hand goes to the plain URL, so each page has one English address,
// - null: leave it alone (/ar/…, portals, login, files such as /sitemap.xml or /admission-form.pdf).
export function publicRoute(pathname: string): { action: "rewrite" | "redirect"; to: string } | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return { action: "redirect", to: pathname.slice(3) || "/" };
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return null;
  if (NOT_PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  if (pathname.split("/").pop()?.includes(".")) return null; // a file
  return { action: "rewrite", to: pathname === "/" ? "/en" : `/en${pathname}` };
}
