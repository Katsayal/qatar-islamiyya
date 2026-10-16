import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { controlClass } from "@/components/form-parts";
import { PickerForm } from "@/components/picker-form";

const button = "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-lg border bg-card px-2 font-medium text-primary hover:border-primary sm:px-4";

// Previous | "Page [n] of N" | Next, for a list split into pages (?page=). Choosing a page in the dropdown
// jumps to it at once. `params` are the page's current filters (without page): the links and the dropdown keep them.
// On a phone the buttons are just chevrons (the word shows from the sm size up). Shows nothing when there is only one page.
export function Pager({
  path,
  params,
  page,
  lastPage,
  prevLabel = "Previous",
  nextLabel = "Next",
}: {
  path: string;
  params: Record<string, string | undefined>;
  page: number;
  lastPage: number;
  prevLabel?: string;
  nextLabel?: string;
}) {
  if (lastPage <= 1) return null;

  const filters = Object.entries(params).filter((e): e is [string, string] => !!e[1]);
  const href = (n: number) => `${path}?${new URLSearchParams([...filters, ["page", String(n)]])}`;

  return (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-2 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label={prevLabel} className={button}>
          <ChevronLeft aria-hidden className="size-5" />
          <span className="hidden sm:inline">{prevLabel}</span>
        </Link>
      ) : (
        <span />
      )}

      {/* key: the dropdown shows the current page after every navigation */}
      <PickerForm key={page} action={path} className="text-muted-foreground">
        {filters.map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <label className="flex items-center gap-2 whitespace-nowrap">
          Page
          <select name="page" defaultValue={page} aria-label="Go to page" className={controlClass}>
            {Array.from({ length: lastPage }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          of {lastPage}
        </label>
      </PickerForm>

      {page < lastPage ? (
        <Link href={href(page + 1)} aria-label={nextLabel} className={button}>
          <span className="hidden sm:inline">{nextLabel}</span>
          <ChevronRight aria-hidden className="size-5" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
