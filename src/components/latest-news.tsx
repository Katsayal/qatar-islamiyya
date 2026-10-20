import Image from "next/image";
import Link from "next/link";
import { PostLangLabel } from "@/components/post-lang-label";
import { ui } from "@/content/ui";
import { formatDate, href, type Lang } from "@/lib/lang";
import { siteImageUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export async function LatestNews({ lang }: { lang: Lang }) {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, lang, cover_path, published_at")
    // RLS already hides drafts and future-dated posts.
    .eq("audience", "public")
    .order("published_at", { ascending: false })
    .limit(3);

  if (!posts?.length) {
    return <p className="mt-6 text-sm text-muted-foreground">{ui[lang].home.noNews}</p>;
  }

  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-3">
      {posts.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {p.cover_path && (
            <Image
              src={siteImageUrl(p.cover_path)}
              alt=""
              width={640}
              height={360}
              sizes="(min-width: 768px) 320px, 100vw"
              className="aspect-video w-full object-cover"
            />
          )}
          <div className="p-4">
            <p lang={p.lang} dir={p.lang === "ar" ? "rtl" : "ltr"}>
              <Link href={href(lang, `/news/${p.id}`)} className="font-semibold hover:text-primary">
                {p.title}
              </Link>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(lang, p.published_at!, "medium")}
              <PostLangLabel postLang={p.lang} lang={lang} />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
