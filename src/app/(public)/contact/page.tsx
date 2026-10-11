import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { school } from "@/content/school";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="Get in touch"
        title="Contact us"
        text="Call, chat on WhatsApp, visit us, or send a message. We are happy to help."
      />

      <div className="mx-auto grid max-w-5xl gap-6 px-4 pt-8 pb-12 md:grid-cols-2">
        <div className="grid content-start gap-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Address</h2>
            <p className="mt-1 text-muted-foreground">{school.address}</p>
            <h2 className="mt-5 font-semibold">Phone</h2>
            <ul className="mt-2 grid gap-2">
              {school.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p}`}
                    className="flex h-12 items-center rounded-lg border bg-secondary px-4 font-medium text-primary hover:border-primary"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={school.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Chat with us on WhatsApp
            </a>
          </div>
          <iframe
            title="Map of the school on Zango Road, Daura"
            src="https://www.google.com/maps?q=Zango+Road,+Daura,+Katsina,+Nigeria&output=embed"
            loading="lazy"
            className="h-72 w-full rounded-xl border shadow-sm"
          />
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm md:self-start md:p-6">
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
