import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setHandled } from "./actions";

const filters = ["open", "handled", "all"];

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireRole("staff");
  const sp = await searchParams;
  const show = filters.includes(sp.show ?? "") ? sp.show! : "open";
  const supabase = await createClient();

  let query = supabase
    .from("contact_messages")
    .select("id, name, phone, message, handled, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (show !== "all") query = query.eq("handled", show === "handled");
  const [{ data: messages }, { count: openCount }] = await Promise.all([
    query,
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        From the website contact form. {openCount ?? 0} not handled yet.
      </p>

      <nav className="mt-3 flex flex-wrap gap-2 text-sm">
        {filters.map((f) => (
          <Link
            key={f}
            href={`/portal/messages?show=${f}`}
            className={`rounded-full border px-3 py-1 capitalize ${f === show ? "bg-primary text-primary-foreground" : ""}`}
          >
            {f}
          </Link>
        ))}
      </nav>

      <ul className="mt-4 space-y-3">
        {(messages ?? []).map((m) => (
          <li key={m.id} className="rounded-lg border p-4">
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
              <button className="h-10 rounded-md border px-4 text-sm hover:bg-muted">
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
