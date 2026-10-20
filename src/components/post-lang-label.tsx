import { ui } from "@/content/ui";
import type { Lang } from "@/lib/lang";

// Small label on a post written in another language than the page ("English" on /ar, "Arabic" on /…).
export function PostLangLabel({ postLang, lang }: { postLang: string; lang: Lang }) {
  if (postLang === lang) return null;
  return (
    <span className="ms-2 inline-block rounded-full border px-2 py-0.5 align-middle text-xs font-normal text-muted-foreground">
      {ui[lang].postLang[postLang] ?? postLang}
    </span>
  );
}
