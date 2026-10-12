import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { PostForm } from "../post-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";

export default async function NewPostPage() {
  await requireRole("staff");
  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href="/portal/posts" className="text-sm text-primary underline-offset-4 hover:underline">
          ← News posts
        </Link>
        <h1 className="mt-2 text-2xl font-semibold gold-bar">Add post</h1>
        <div className="mt-4">
          <PostForm defaults={{ title: "", body: "", lang: "en", audience: "public", published: true, hasCover: false }} />
        </div>
      </div>
    </FreshOnVisit>
  );
}
