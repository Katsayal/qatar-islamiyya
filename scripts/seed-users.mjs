// Creates the owner account (and DEV test accounts with --test).
//   node --env-file=.env.local scripts/seed-users.mjs          → owner only
//   node --env-file=.env.local scripts/seed-users.mjs --test   → owner + test accounts
// Owner comes from OWNER_EMAIL / OWNER_PASSWORD / OWNER_NAME in .env.local.
// Safe to re-run: existing accounts are skipped.
import { createClient } from "@supabase/supabase-js";

const DEV_PROJECT_REF = "zjhtblrdwjfdzwutjpzs";

// DEV ONLY test accounts. Never created on any other project (checked below).
const TEST_PASSWORD = "qatar-dev-test-7413";
const TEST_ACCOUNTS = [
  { email: "test-staff@qatar.test", role: "staff", full_name: "Test Staff" },
  { email: "test-teacher@qatar.test", role: "teacher", full_name: "Test Teacher" },
  // Student: email must match admissionToEmail("TEST001") in src/lib/auth.ts
  { email: "test001@students.qatar.local", role: "student", full_name: "Test Student", admission_no: "TEST001" },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false } });

async function createAccount({ email, password, role, full_name, is_owner = false }) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role, full_name, is_owner }, // read by the handle_new_user trigger
  });
  if (error) {
    if (error.code === "email_exists") {
      console.log(`skip   ${email} (already exists)`);
      return null;
    }
    throw new Error(`${email}: ${error.message}`);
  }
  console.log(`create ${email} (${role}${is_owner ? ", owner" : ""})`);
  return data.user.id;
}

// Owner
const { OWNER_EMAIL, OWNER_PASSWORD, OWNER_NAME } = process.env;
if (OWNER_EMAIL && OWNER_PASSWORD && OWNER_NAME) {
  await createAccount({
    email: OWNER_EMAIL,
    password: OWNER_PASSWORD,
    role: "staff",
    full_name: OWNER_NAME,
    is_owner: true,
  });
} else {
  console.log("skip   owner (set OWNER_EMAIL, OWNER_PASSWORD, OWNER_NAME in .env.local)");
}

// Test accounts (DEV only)
if (process.argv.includes("--test")) {
  if (!url.includes(DEV_PROJECT_REF)) {
    console.error("Refusing to create test accounts: not the DEV project.");
    process.exit(1);
  }
  for (const acc of TEST_ACCOUNTS) {
    const userId = await createAccount({ ...acc, password: TEST_PASSWORD });
    if (userId && acc.admission_no) {
      const { error } = await supabase.from("students").insert({
        admission_no: acc.admission_no,
        full_name: acc.full_name,
        gender: "male",
        user_id: userId,
      });
      if (error) throw new Error(`student row: ${error.message}`);
      console.log(`create student row ${acc.admission_no}`);
    }
  }
}
