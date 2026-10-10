import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "../../post-form";
import { DeletePost } from "./delete-post";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("staff");
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  return (
    <div className="max-w-xl">
      <Link href="/portal/posts" className="text-sm text-primary underline-offset-4 hover:underline">
        ← News posts
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Edit post</h1>
      <div className="mt-4">
        <PostForm
          defaults={{
            id: p.id,
            title: p.title,
            body: p.body,
            lang: p.lang,
            audience: p.audience,
            published: p.published_at !== null,
            hasCover: p.cover_path !== null,
          }}
        />
      </div>
      <div className="mt-8">
        <DeletePost id={p.id} />
      </div>
    </div>
  );
}
