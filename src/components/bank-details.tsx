import { ui } from "@/content/ui";
import type { Lang } from "@/lib/lang";
import { createClient } from "@/lib/supabase/server";

// Bank details are public (anon can read school_settings); staff edit them in Settings (task 4.7).
// Also on the student portal's Fees page, which is English only (default).
export async function BankDetails({ lang = "en" }: { lang?: Lang }) {
  const t = ui[lang].bank;
  const supabase = await createClient();
  const { data } = await supabase
    .from("school_settings")
    .select("bank_name, account_name, account_number")
    .eq("id", 1)
    .maybeSingle();

  if (!data?.account_number) {
    return <p className="mt-2 text-sm text-muted-foreground">{t.soon}</p>;
  }

  return (
    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <dt className="text-muted-foreground">{t.bank}</dt>
      <dd>{data.bank_name}</dd>
      <dt className="text-muted-foreground">{t.accountName}</dt>
      <dd>{data.account_name}</dd>
      <dt className="text-muted-foreground">{t.accountNumber}</dt>
      <dd className="font-medium">{data.account_number}</dd>
    </dl>
  );
}
