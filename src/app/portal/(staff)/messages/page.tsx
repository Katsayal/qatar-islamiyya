import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setHandled } from "./actions";
import { Corrections } from "./corrections";

// Navigations here must show the loading skeleton at once (checked in dev).
export const instant = true;

const filters = ["open", "handled", "all"];

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ show?: string; kind?: string }> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const corrections = sp.kind === "corrections";
  const show = filters.includes(sp.show ?? "") ? sp.show! : "open";
  const supabase = await createClient();

  let query = supabase
    .from("contact_messages")
    .select("id, name, phone, message, handled, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (show !== "all") query = query.eq("handled", show === "handled");
  const [{ data: messages }, { count: openCount }, { count: openCorrections }] = await Promise.all([
    query,
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
    supabase.from("correction_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const tab = (active: boolean) => `rounded-lg border px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "bg-card"}`;
  const heading = (
    <>
      <h1 className="text-2xl font-semibold gold-bar">Messages</h1>
      <nav className="mt-3 flex gap-2">
        <Link href="/portal/messages" className={tab(!corrections)}>
          Website ({openCount ?? 0})
        </Link>
        <Link href="/portal/messages?kind=corrections" className={tab(corrections)}>
          Student corrections ({openCorrections ?? 0})
        </Link>
      </nav>
    </>
  );

  if (corrections) {
    return (
      <div className="max-w-2xl">
        {heading}
        <p className="mt-3 text-sm text-muted-foreground">
          Requests from students to correct their details. Fix the student record, then mark it done.
        </p>
        <Corrections show={sp.show} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {heading}
      <p className="mt-3 text-sm text-muted-foreground">
        From the website contact form. {openCount ?? 0} not handled yet.
      </p>

      <nav className="mt-3 flex flex-wrap gap-2 text-sm">
        {filters.map((f) => (
          <Link
            key={f}
            href={`/portal/messages?show=${f}`}
            className={`rounded-full border px-3 py-1 capitalize ${f === show ? "bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}
          >
            {f}
          </Link>
        ))}
      </nav>

      <ul className="mt-4 space-y-3">
        {(messages ?? []).map((m) => (
          <li key={m.id} className="rounded-xl border p-4 bg-card shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{m.name}</p>
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="text-sm text-primary underline-offset-4 hover:underline">
                    {m.phone}
                  </a>
                )}
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {new Date(m.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })}
              </p>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
            <form action={setHandled.bind(null, m.id, !m.handled)} className="mt-3">
              <button className="h-10 rounded-lg border px-4 text-sm hover:bg-muted bg-card">
                {m.handled ? "Mark as not handled" : "Mark as handled"}
              </button>
            </form>
          </li>
        ))}
        {!messages?.length && <li className="text-sm text-muted-foreground">No messages here.</li>}
      </ul>
    </div>
  );
}
