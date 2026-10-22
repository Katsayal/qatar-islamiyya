import { school } from "@/content/school";
import type { Lang } from "@/lib/lang";
import { siteUrl } from "@/lib/site";

// 0803… → +234803…
const international = (phone: string) => `+234${phone.slice(1)}`;

// Structured data for search engines: who the school is and where. Home page only. All values are fixed text from the code.
export function SchoolJsonLd({ lang }: { lang: Lang }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: lang === "ar" ? school.nameAr : school.name,
    alternateName: lang === "ar" ? school.name : school.nameAr,
    url: lang === "ar" ? `${siteUrl}/ar` : siteUrl,
    logo: `${siteUrl}/logo.svg`,
    telephone: school.phones.map(international),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Zango Road",
      addressLocality: "Daura",
      addressRegion: "Katsina State",
      addressCountry: "NG",
    },
  };
  // "<" is escaped so the text can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
