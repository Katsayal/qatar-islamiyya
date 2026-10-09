import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const pages = ["", "/about", "/programs", "/admissions", "/news", "/gallery", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, published_at")
    .eq("audience", "public");

  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}` })),
    ...(posts ?? []).map((p) => ({
      url: `${siteUrl}/news/${p.id}`,
      lastModified: p.published_at ?? undefined,
    })),
  ];
}
