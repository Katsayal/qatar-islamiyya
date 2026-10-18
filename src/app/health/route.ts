import { createClient } from "@/lib/supabase/server";

// GET /health -> {"ok":true} after one database read, 503 if it fails. Called by the uptime monitor
// (keeps the free Supabase project awake and the Netlify function warm). Public: returns no data.
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("school_settings").select("id").limit(1);
  const ok = !error; // an empty result still proves the database answered
  return Response.json({ ok }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
