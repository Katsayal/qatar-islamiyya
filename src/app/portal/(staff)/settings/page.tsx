import { CalendarDays, Landmark, PenLine } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BankForm } from "./bank-form";
import { SignatureForm } from "./signature-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";
import { DualDate } from "@/components/dual-date";
import { todayInLagos } from "@/lib/today";
import { HijriForm } from "./hijri-form";
import { HijriChanges } from "./hijri-changes";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function SettingsPage() {
  await requireRole("staff");
  const supabase = await createClient();
  const [{ data: s }, { data: hijri }] = await Promise.all([
    supabase.from("school_settings").select("bank_name, account_name, account_number, signature_path").eq("id", 1).maybeSingle(),
    supabase.from("hijri_offsets").select("id, starts_on, days").order("starts_on", { ascending: false }),
  ]);
  const changes = hijri ?? [];
  const today = todayInLagos();

  let signatureUrl: string | null = null;
  if (s?.signature_path) {
    const { data } = await supabase.storage.from("private").createSignedUrl(s.signature_path, 3600);
    signatureUrl = data?.signedUrl ?? null;
  }

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold gold-bar">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">School details used on the website and on report cards, and the Hijri date.</p>

        <section className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <Landmark aria-hidden className="size-4 text-primary" /> Bank details
          </h2>
          <div className="mt-3">
            <BankForm defaults={{ bank_name: s?.bank_name ?? "", account_name: s?.account_name ?? "", account_number: s?.account_number ?? "" }} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <PenLine aria-hidden className="size-4 text-primary" /> Director&apos;s signature
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Printed at the bottom of every report card.</p>
          <div className="mt-3">
            <SignatureForm currentUrl={signatureUrl} />
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold">
            <CalendarDays aria-hidden className="size-4 text-primary" /> Hijri date
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Today, as shown across the portal and on the website:</p>
          <DualDate iso={today} offsets={changes} weekday className="mt-2 text-lg font-semibold" />
          <div className="mt-4">
            <HijriForm today={today} offsets={changes} />
          </div>
          <h3 className="mt-6 text-sm font-semibold">Past changes</h3>
          <div className="mt-2">
            <HijriChanges changes={changes} />
          </div>
        </section>
      </div>
    </FreshOnVisit>
  );
}
