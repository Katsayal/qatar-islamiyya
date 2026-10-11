import type { NextConfig } from "next";

// Public site images (gallery, post covers) come from the Supabase `site` bucket.
const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost").hostname;

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: supabaseHost }] },
  /* config options here */
  cacheComponents: true,
  // Dev only: let phones on the local network (e.g. http://192.168.x.x:3000) load the dev scripts, so client JS runs there.
  allowedDevOrigins: ["192.168.*.*", "172.*.*.*", "10.*.*.*"],
  experimental: {
    // Largest upload is a document (max 5 MB) + multipart overhead. Netlify's own request limit is ~6 MB.
    serverActions: { bodySizeLimit: "6mb" },
    // Dev "instant navigation" checks only for pages that export `instant` (the busy pages with a loading skeleton).
    instantInsights: { validationLevel: "manual-warning" },
  },
  // Basic security headers: no framing (clickjacking on login/portal), no MIME sniffing, short referrers.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
