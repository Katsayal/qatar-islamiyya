import type { Metadata } from "next";
import { href, type Lang } from "./lang.ts";

// Metadata of a public page: its title and its two language versions (hreflang), so search engines
// link /about and /ar/about. `path` is the English path ("/about"); absolute URLs come from metadataBase.
export function pageMeta(lang: Lang, path: string, title?: string): Metadata {
  return {
    ...(title ? { title } : {}),
    alternates: {
      canonical: href(lang, path),
      languages: { en: path, ar: href("ar", path), "x-default": path },
    },
  };
}
