"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NigeriaFlag, QatarFlag } from "@/components/flags";
import { browserPath, href, otherLangPath, type Lang } from "@/lib/lang";

type Props = { lang: Lang; className: string };

// Shows only the other language: Qatar flag + "AR" on English pages, Nigeria flag + "EN" on Arabic pages
// (owner's choice, SPEC §7). Screen readers hear the language name ("العربية" / "English").
// usePathname() needs <Suspense> (Cache Components): until it streams in, the link goes to the other home page.
export function LangSwitch(props: Props) {
  return (
    <Suspense fallback={<SwitchLink {...props} to={href(props.lang === "en" ? "ar" : "en", "/")} />}>
      <CurrentPageSwitch {...props} />
    </Suspense>
  );
}

function CurrentPageSwitch(props: Props) {
  const pathname = browserPath(usePathname());
  return <SwitchLink {...props} to={otherLangPath(pathname)} />;
}

function SwitchLink({ lang, className, to }: Props & { to: string }) {
  const toArabic = lang === "en";
  return (
    <Link
      href={to}
      // Stay at the same height on the page instead of jumping to the top (same layout in both languages).
      scroll={false}
      hrefLang={toArabic ? "ar" : "en"}
      aria-label={toArabic ? "العربية" : "English"}
      className={`inline-flex items-center gap-1.5 font-sans ${className}`}
    >
      {toArabic ? <QatarFlag /> : <NigeriaFlag />}
      <span>{toArabic ? "AR" : "EN"}</span>
    </Link>
  );
}
