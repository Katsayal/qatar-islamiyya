// Green title band at the top of the public pages (same look as the home hero, smaller).
export function PageHeader({
  label,
  title,
  text,
  children,
}: {
  label: string;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="pattern-star bg-deep text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">{label}</p>
        <h1 className="mt-1 text-3xl font-semibold md:text-4xl">{title}</h1>
        {text && <p className="mt-3 max-w-2xl text-white/80">{text}</p>}
        {children}
      </div>
    </section>
  );
}
