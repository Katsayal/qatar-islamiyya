// Logins without an email: students sign in with their admission number, teachers and staff with a
// login code (QAT001). Supabase needs an email, so both become a synthetic address on one domain.
const DOMAIN = "@students.qatar.local";

// "QIS/2026/001" → "qis-2026-001@students.qatar.local". Also used when creating student accounts.
export function admissionToEmail(admissionNo: string) {
  const local = admissionNo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${local}${DOMAIN}`;
}

// A teacher/staff login code: letters, digits and "-", 3 to 30 characters.
export function isLoginCode(input: string) {
  return /^[a-z0-9-]{3,30}$/i.test(input.trim());
}

// What the login box or the add form holds → the address Supabase knows. An email stays an email.
export function loginToEmail(input: string) {
  const v = input.trim();
  return v.includes("@") ? v.toLowerCase() : admissionToEmail(v);
}

// The address Supabase knows → what people type: "qat001@students.qatar.local" → "QAT001".
export function loginLabel(email: string | null | undefined) {
  if (!email) return "—";
  return email.endsWith(DOMAIN) ? email.slice(0, -DOMAIN.length).toUpperCase() : email;
}
