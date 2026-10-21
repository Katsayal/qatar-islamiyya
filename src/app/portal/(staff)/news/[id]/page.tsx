import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { requireRole } from "@/lib/auth";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { DualDate } from "@/components/dual-date";
import { getHijriOffsets } from "@/lib/hijri-offsets";
import { lagosDate } from "@/lib/today";

export default async function NewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("teacher", "staff");
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, body, lang, cover_path, published_at")
    .eq("id", id)
    .in("audience", ["public", "internal"])
    .not("published_at", "is", null)
    .maybeSingle();
  if (!post) notFound();

  const hijri = await getHijriOffsets();
  return (
    <article className="max-w-3xl">
      <Link href="/portal/news" className="text-sm text-primary underline-offset-4 hover:underline">
        ← News
      </Link>
      {post.cover_path && (
        <Image src={siteImageUrl(post.cover_path)} alt="" width={960} height={540} className="mt-4 aspect-video w-full rounded-lg object-cover" />
      )}
      <h1 className="mt-4 text-2xl font-semibold gold-bar">{post.title}</h1>
      <DualDate iso={lagosDate(post.published_at!)} offsets={hijri} className="mt-1 text-sm font-medium" />
      <PostBody body={post.body} lang={post.lang} />
    </article>
  );
}
