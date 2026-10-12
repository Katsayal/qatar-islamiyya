import { changes, describe, type AuditEntry, type Lookups } from "@/lib/audit";
import { StatusBadge } from "@/components/status-badge";

const tone = { create: "good", edit: "warn", delete: "bad", account: "muted" } as const;

// One activity-log row: when, who, what, and a closed "What changed" list.
export function AuditItem({
  entry,
  look,
  role,
}: {
  entry: AuditEntry & { at: string; actor_id: string | null; actor_name: string | null };
  look: Lookups;
  role?: string;
}) {
  const { title, name } = describe(entry, look);
  const lines = changes(entry, look);
  const when = new Date(entry.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });
  const who = entry.actor_id ? entry.actor_name || "Unknown account" : "Website / system";

  return (
    <li className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm">
          <span className="font-medium">{title}</span>
          {name && <span className="break-words"> “{name}”</span>}
        </p>
        <StatusBadge tone={tone[entry.action as keyof typeof tone] ?? "muted"}>{entry.action}</StatusBadge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {when} · {who}
        {role && <span className="capitalize"> ({role})</span>}
      </p>
      {lines.length > 0 && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-primary">What changed</summary>
          <dl className="mt-2 space-y-1">
            {lines.map((l) => (
              <div key={l.field} className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
                <dt className="text-muted-foreground">{l.field}</dt>
                <dd className="min-w-0 break-words">
                  {l.from !== undefined && (
                    <>
                      <span className="text-muted-foreground line-through">{l.from}</span> →{" "}
                    </>
                  )}
                  {l.to}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </li>
  );
}
