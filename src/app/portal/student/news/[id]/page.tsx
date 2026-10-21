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

export default async function StudentNewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("student");
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, body, lang, cover_path, published_at")
    .eq("id", id)
    .in("audience", ["public", "students"])
    .not("published_at", "is", null)
    .maybeSingle();
  if (!post) notFound();

  const hijri = await getHijriOffsets();
  return (
    <article className="max-w-3xl">
      <Link
        href="/portal/student/news"
        className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-medium text-primary hover:border-primary"
      >
        ← News
      </Link>
      {post.cover_path && (
        <Image src={siteImageUrl(post.cover_path)} alt="" width={960} height={540} className="mt-4 aspect-video w-full rounded-xl object-cover shadow-sm" />
      )}
      <h1 className="mt-4 text-2xl font-semibold gold-bar">{post.title}</h1>
      <DualDate iso={lagosDate(post.published_at!)} offsets={hijri} className="mt-1 text-sm font-medium" />
      <PostBody body={post.body} lang={post.lang} />
    </article>
  );
}
