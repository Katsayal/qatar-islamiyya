import type { Metadata } from "next";
import { href, type Lang } from "./lang.ts";

// The link-preview image (public/og-image.png: the logo on deep green with the school's names, drawn once).
// Listed explicitly because a page's own openGraph replaces any file-based default.
export const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "Madrasatu Hajiya Hindatu, Daura, Katsina State" };

// Metadata of a public page: its title, its two language versions (hreflang), so search engines
// link /about and /ar/about, and the link-preview (Open Graph) basics. `path` is the English path ("/about");
// absolute URLs come from metadataBase. The preview image is OG_IMAGE unless a page sets its own.
export function pageMeta(lang: Lang, path: string, title?: string): Metadata {
  return {
    ...(title ? { title } : {}),
    openGraph: { type: "website", siteName: "Madrasatu Hajiya Hindatu", url: href(lang, path), images: [OG_IMAGE], ...(title ? { title } : {}) },
    twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
    alternates: {
      canonical: href(lang, path),
      languages: { en: path, ar: href("ar", path), "x-default": path },
    },
  };
}
