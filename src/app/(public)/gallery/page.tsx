import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
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
    return <p className="rounded-xl border bg-card p-6 text-muted-foreground">Photos will be added here soon.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((g) => (
        <li key={g.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Image
            src={siteImageUrl(g.image_path)}
            alt={g.caption ?? "School photo"}
            width={480}
            height={480}
            className="aspect-square w-full object-cover"
          />
          {g.caption && <p className="p-3 text-xs text-muted-foreground">{g.caption}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function GalleryPage() {
  return (
    <>
      <PageHeader label="Life at the school" title="Gallery" />
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-12">
        <Suspense fallback={<PhotosSkeleton />}>
          <GalleryGrid />
        </Suspense>
      </section>
    </>
  );
}
