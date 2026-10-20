"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { browserPath, href, otherLangPath, type Lang } from "@/lib/lang";

type Props = { lang: Lang; className: string };

// "العربية" on English pages, "English" on Arabic pages: the same page in the other language.
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
  return lang === "en" ? (
    <Link href={to} hrefLang="ar" lang="ar" className={`font-arabic ${className}`}>
      العربية
    </Link>
  ) : (
    <Link href={to} hrefLang="en" lang="en" className={`font-sans ${className}`}>
      English
    </Link>
  );
}
