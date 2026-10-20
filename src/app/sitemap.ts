import type { MetadataRoute } from "next";
import { href, LANGS } from "@/lib/lang";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const pages = ["/", "/about", "/programs", "/admissions", "/news", "/gallery", "/contact", "/donate"];

// Every public page and public post in both languages (/… and /ar/…), each listing its other version.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, published_at")
    .eq("audience", "public");

  const entries = [
    ...pages.map((path) => ({ path, lastModified: undefined as string | undefined })),
    ...(posts ?? []).map((p) => ({ path: `/news/${p.id}`, lastModified: p.published_at ?? undefined })),
  ];
  const url = (path: string) => `${siteUrl}${path === "/" ? "" : path}`;

  return entries.flatMap(({ path, lastModified }) =>
    LANGS.map((lang) => ({
      url: url(href(lang, path)),
      lastModified,
      alternates: { languages: { en: url(path), ar: url(href("ar", path)) } },
    })),
  );
}
