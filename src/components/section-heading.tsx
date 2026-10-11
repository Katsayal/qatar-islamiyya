// Small gold label above a section title, used on the public pages.
export function SectionHeading({
  label,
  title,
  light = false,
}: {
  label: string;
  title: string;
  light?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">{label}</p>
      <h2 className={`mt-1 text-2xl font-semibold md:text-3xl ${light ? "text-white" : ""}`}>
        {title}
      </h2>
    </div>
  );
}
