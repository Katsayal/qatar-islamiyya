// Green greeting band at the top of a portal home page (staff, teacher and student).
export function PortalBanner({
  title,
  subtitle,
  photo,
  date,
}: {
  title: string;
  subtitle?: string;
  photo?: React.ReactNode;
  /** Today's date (DualDate), under the subtitle. */
  date?: React.ReactNode;
}) {
  return (
    <section className="pattern-star flex items-center gap-4 rounded-xl bg-deep p-5 text-white shadow-sm md:p-6">
      {photo}
      <div className="min-w-0">
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-white/75">{subtitle}</p>}
        {date && <div className="mt-2 text-sm font-medium text-gold">{date}</div>}
      </div>
    </section>
  );
}
