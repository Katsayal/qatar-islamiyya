import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Naskh_Arabic, Amiri_Quran } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  // `subsets` = what gets preloaded. latin-ext (Hausa ɓ ɗ ƙ ƴ, 168 KB) is still in the CSS and loads only when such a letter is on the page.
  subsets: ["latin"],
});

// Arabic fonts are not preloaded (~140 KB): they load when Arabic text appears, text shows in a fallback first.
const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  preload: false,
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  // Absolute URLs for canonical/hreflang links (NEXT_PUBLIC_SITE_URL on Netlify).
  metadataBase: new URL(siteUrl),
  title: "Madrasatu Hajiya Hindatu (Qatar Multi-Purpose Centre)",
  description: "Islamic school in Daura, Katsina State: Tahfiz, Ma'ahad and Barnamaj.",
};

// Phone browser bar in the school's deep green (= --deep).
export const viewport: Viewport = { themeColor: "#003912" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoNaskh.variable} ${amiriQuran.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
