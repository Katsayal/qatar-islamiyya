import type { Metadata } from "next";
import { school } from "@/content/school";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Contact us</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">Address</h2>
          <p className="mt-1 text-muted-foreground">{school.address}</p>
          <h2 className="mt-4 font-semibold">Phone</h2>
          <ul className="mt-1 text-muted-foreground">
            {school.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="hover:text-primary">
                  {p}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={school.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-primary underline-offset-4 hover:underline"
          >
            Chat with us on WhatsApp
          </a>
          <iframe
            title="Map of the school on Zango Road, Daura"
            src="https://www.google.com/maps?q=Zango+Road,+Daura,+Katsina,+Nigeria&output=embed"
            loading="lazy"
            className="mt-6 h-64 w-full rounded-lg border"
          />
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
