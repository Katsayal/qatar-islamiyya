import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { CaptionForm, DeletePhoto } from "../photo-forms";
import { FreshOnVisit } from "@/components/fresh-on-visit";

export default async function EditPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("staff");
  const { id } = await params;
  const supabase = await createClient();
  const { data: g } = await supabase.from("gallery_items").select("id, image_path, caption").eq("id", id).maybeSingle();
  if (!g) notFound();

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href="/portal/gallery" className="text-sm text-primary underline-offset-4 hover:underline">
          ← Gallery
        </Link>
        {/* Fixed-height box: the form below must not jump down when the image arrives. */}
        <div className="mt-3 h-72 overflow-hidden rounded-lg bg-muted md:h-96">
          <Image
            src={siteImageUrl(g.image_path)}
            alt={g.caption ?? "School photo"}
            width={640}
            height={640}
            loading="eager"
            className="size-full object-contain"
          />
        </div>
        <div className="mt-4">
          <CaptionForm id={g.id} caption={g.caption ?? ""} />
        </div>
        <div className="mt-8">
          <DeletePhoto id={g.id} />
        </div>
      </div>
    </FreshOnVisit>
  );
}
