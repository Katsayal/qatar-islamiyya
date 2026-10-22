import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Public pages are open; the portal, health check and API are not for search engines.
// /login is NOT blocked here: it carries `noindex` instead (a blocked page's noindex is never read).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/portal", "/health", "/api"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
