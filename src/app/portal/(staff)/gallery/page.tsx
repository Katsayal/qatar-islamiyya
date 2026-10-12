import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "./upload-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function GalleryAdminPage() {
  await requireRole("staff");
  const supabase = await createClient();
  // Same order as the public gallery.
  const { data } = await supabase
    .from("gallery_items")
    .select("id, image_path, caption")
    .order("sort_order")
    .order("created_at", { ascending: false });
  const items = data ?? [];

  return (
    <FreshOnVisit>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold gold-bar">Gallery</h1>
        <div className="mt-4">
          <UploadForm />
        </div>

        {items.length === 0 ? (
          <p className="mt-6 rounded-xl border p-4 text-sm text-muted-foreground bg-card shadow-sm">No photos yet.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((g) => (
              <li key={g.id}>
                <Link href={`/portal/gallery/${g.id}`} className="block">
                  <Image
                    src={siteImageUrl(g.image_path)}
                    alt={g.caption ?? "School photo"}
                    width={320}
                    height={320}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <p className="mt-1 truncate text-xs text-muted-foreground">{g.caption ?? "No caption"}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FreshOnVisit>
  );
}
