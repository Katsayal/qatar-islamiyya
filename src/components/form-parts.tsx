// Shared look for the public forms (application, and later contact): one place for the field styles.

const base =
  "w-full rounded-lg border border-input bg-white px-3 text-base shadow-xs outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20";

export const inputClass = `${base} h-12`;
export const textareaClass = `${base} py-2.5`;

export function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${className}`}>
      {label}
      {children}
    </label>
  );
}

// A titled block of fields: two columns on wider screens, one on a phone.
export function FormSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t pt-6 first:border-t-0 first:pt-0">
      <h3 className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
          {step}
        </span>
        {title}
      </h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}
