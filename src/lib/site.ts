// Public image in the `site` bucket (gallery, post covers).
export function siteImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site/${path}`;
}

// Real domain is still pending; set NEXT_PUBLIC_SITE_URL at go-live.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
