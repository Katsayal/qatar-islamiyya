// Green greeting band at the top of a portal home page (staff, teacher and student).
export function PortalBanner({
  title,
  subtitle,
  photo,
}: {
  title: string;
  subtitle?: string;
  photo?: React.ReactNode;
}) {
  return (
    <section className="pattern-star flex items-center gap-4 rounded-xl bg-deep p-5 text-white shadow-sm md:p-6">
      {photo}
      <div className="min-w-0">
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-white/75">{subtitle}</p>}
      </div>
    </section>
  );
}
