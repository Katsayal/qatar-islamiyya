import type { NextConfig } from "next";

// Public site images (gallery, post covers) come from the Supabase `site` bucket.
const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost").hostname;

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: supabaseHost }] },
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Largest upload is a document (max 5 MB) + multipart overhead. Netlify's own request limit is ~6 MB.
    serverActions: { bodySizeLimit: "6mb" },
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
