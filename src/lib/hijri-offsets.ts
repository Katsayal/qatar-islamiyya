import { cache } from "react";
import type { HijriOffset } from "@/lib/hijri";
import { createClient } from "@/lib/supabase/server";

// Every Hijri offset change (a few a year at most), read once per request. See lib/hijri.ts.
export const getHijriOffsets = cache(async (): Promise<HijriOffset[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("hijri_offsets").select("starts_on, days").order("starts_on");
  return data ?? [];
});
