import type { NextConfig } from "next";

// Public site images (gallery, post covers) come from the Supabase `site` bucket.
const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost").hostname;

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: supabaseHost }] },
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Admission form photo (max 2 MB) + multipart overhead.
    serverActions: { bodySizeLimit: "3mb" },
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
