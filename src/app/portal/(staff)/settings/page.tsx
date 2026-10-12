import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BankForm } from "./bank-form";
import { SignatureForm } from "./signature-form";
import { FreshOnVisit } from "@/components/fresh-on-visit";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

export default async function SettingsPage() {
  await requireRole("staff");
  const supabase = await createClient();
  const { data: s } = await supabase.from("school_settings").select("bank_name, account_name, account_number, signature_path").eq("id", 1).maybeSingle();

  let signatureUrl: string | null = null;
  if (s?.signature_path) {
    const { data } = await supabase.storage.from("private").createSignedUrl(s.signature_path, 3600);
    signatureUrl = data?.signedUrl ?? null;
  }

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold gold-bar">Settings</h1>

        <section className="mt-6">
          <h2 className="font-semibold">Bank details</h2>
          <div className="mt-3">
            <BankForm defaults={{ bank_name: s?.bank_name ?? "", account_name: s?.account_name ?? "", account_number: s?.account_number ?? "" }} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-semibold">Director&apos;s signature</h2>
          <p className="mt-1 text-sm text-muted-foreground">Printed at the bottom of every report card.</p>
          <div className="mt-3">
            <SignatureForm currentUrl={signatureUrl} />
          </div>
        </section>
      </div>
    </FreshOnVisit>
  );
}
