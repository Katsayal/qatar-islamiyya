// Bulk login creation: how many students one click handles, and how many are created at the same time.
// Measured on DEV: about 0.3 s per login, whatever the concurrency (20 logins took 6-7 s, too close to a 10 s
// server limit), so 10 per click (about 3 s) leaves a wide margin. (A "use server" file may only export
// functions, so these live here.)
export const LOGIN_BATCH = 10;
export const LOGIN_CHUNK = 5;
