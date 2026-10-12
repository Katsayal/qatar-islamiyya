// People who can teach a class or a book: teachers, and staff members who also teach.
// For dropdowns, staff are marked so the office can tell them apart.
export function withStaffTag(people: { id: string; full_name: string; role: string }[] | null) {
  return (people ?? []).map((p) => ({
    id: p.id,
    full_name: p.role === "staff" ? `${p.full_name} (staff)` : p.full_name,
  }));
}
