// Shared look for the form fields (public forms and the portal): one place for the field styles.
import { Search } from "lucide-react";

const base =
  "rounded-lg border border-input bg-white px-3 text-base shadow-xs outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20";

// Public forms: fields fill their label. controlClass = same look without a width (portal filter bars).
export const inputClass = `${base} h-12 w-full`;
export const textareaClass = `${base} w-full py-2.5`;
export const controlClass = `${base} h-11`;
export const fileInputClass =
  "w-full rounded-lg border border-input bg-white p-2 text-sm file:me-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-medium file:text-primary";

// The search box of a filter bar: magnifier inside, submits on Enter (see PickerForm).
export function SearchField({
  name = "q",
  defaultValue,
  placeholder = "Search name or admission no.",
  className = "",
}: {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${controlClass} w-full ps-9`}
      />
    </div>
  );
}

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
