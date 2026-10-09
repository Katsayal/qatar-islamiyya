// Today's date in Nigeria (YYYY-MM-DD). The server runs in UTC, so don't use toISOString for "today".
export function todayInLagos() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}
