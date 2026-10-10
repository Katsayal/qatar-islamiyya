import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "teacher" | "staff" | "student";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  is_owner: boolean;
};

// Students log in with their admission number; Supabase needs an email.
// "QIS/2026/001" → "qis-2026-001@students.qatar.local". Also used when creating student accounts.
export function admissionToEmail(admissionNo: string) {
  const local = admissionNo.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${local}@students.qatar.local`;
}

export function homeFor(role: Role) {
  return role === "student" ? "/portal/student" : "/portal";
}

// Current user's profile, or null if logged out / no profile / disabled. Once per request.
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_owner, active")
    .eq("id", userId)
    .maybeSingle();
  if (!profile || !profile.active) return null;

  return {
    id: profile.id,
    full_name: profile.full_name,
    role: profile.role as Role,
    is_owner: profile.is_owner,
  };
});

// Owner-only pages, actions and routes (salaries). Anyone else goes back to the portal home.
export async function requireOwner(): Promise<Profile> {
  const profile = await requireRole("staff");
  if (!profile.is_owner) redirect("/portal");
  return profile;
}

// Use at the top of protected layouts/pages. Wrong role → that user's own home.
export async function requireRole(...roles: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!roles.includes(profile.role)) redirect(homeFor(profile.role));
  return profile;
}
