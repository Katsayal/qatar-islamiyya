// Barnamaj attendance helpers. Pure so `node --test` can run them.

export const STATUSES = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
] as const;

export type Status = (typeof STATUSES)[number]["value"];

// School days: Saturday, Sunday, Tuesday, Wednesday (see SPEC §5.3). Input is an ISO date (YYYY-MM-DD).
export function isSchoolDay(iso: string) {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return day === 6 || day === 0 || day === 2 || day === 3;
}
