// Today's date in Nigeria (YYYY-MM-DD). The server runs in UTC, so don't use toISOString for "today".
export function todayInLagos() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}

// The Nigerian day (YYYY-MM-DD) of a timestamp, e.g. a post's published_at: 23:30 UTC is already the next day in Lagos.
export function lagosDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}
