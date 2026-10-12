// Barnamaj attendance statuses, shared by the attendance form and its server action.

export const STATUSES = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "excused", label: "Excused" },
] as const;

export type Status = (typeof STATUSES)[number]["value"];
