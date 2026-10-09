// Fee status always follows from the two amounts; it is never typed by hand.
export function feeStatus(due: number, paid: number) {
  if (due > 0 && paid >= due) return "paid";
  return paid > 0 ? "part" : "unpaid";
}
