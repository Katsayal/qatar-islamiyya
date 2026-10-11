import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { PhotosSkeleton } from "@/components/page-skeleton";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Gallery" };

async function GalleryGrid() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("gallery_items")
    .select("id, image_path, caption")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (!items?.length) {
    return <p className="mt-6 text-muted-foreground">Photos will be added here soon.</p>;
  }

  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((g) => (
        <li key={g.id}>
          <Image
            src={siteImageUrl(g.image_path)}
            alt={g.caption ?? "School photo"}
            width={480}
            height={480}
            className="aspect-square w-full rounded-lg object-cover"
          />
          {g.caption && <p className="mt-1 text-xs text-muted-foreground">{g.caption}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function GalleryPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Gallery</h1>
      <Suspense fallback={<div className="mt-6"><PhotosSkeleton /></div>}>
        <GalleryGrid />
      </Suspense>
    </section>
  );
}
