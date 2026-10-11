const tones = {
  good: "bg-primary/10 text-primary",
  warn: "bg-gold/25 text-amber-900",
  bad: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

// A small coloured pill for a status (paid, behind, finished...). Colour is never the only signal: the text says it too.
export function StatusBadge({ tone, children }: { tone: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
