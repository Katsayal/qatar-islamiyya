import type { Metadata } from "next";
import { Noto_Sans, Noto_Naskh_Arabic, Amiri_Quran } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"], // latin-ext covers Hausa ɓ ɗ ƙ ƴ
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
});

const amiriQuran = Amiri_Quran({
  variable: "--font-amiri-quran",
  subsets: ["arabic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Madrasatu Hajiya Hindatu (Qatar Multi-Purpose Centre)",
  description: "Islamic school in Daura, Katsina State: Tahfiz, Ma'ahad and Barnamaj.",
};

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
