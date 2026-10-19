"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { homeFor, type Role } from "@/lib/auth";
import { loginToEmail } from "@/lib/login-id";

const loginSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
});

// Returns an error message, or redirects on success.
export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const parsed = loginSchema.safeParse({
    login: formData.get("login"),
    password: formData.get("password"),
  });
  if (!parsed.success) return "Enter your login and password.";

  const { login, password } = parsed.data;
  const email = loginToEmail(login);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "Wrong login details.";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile || !profile.active) {
    await supabase.auth.signOut();
    return "This account is disabled. Please contact the school.";
  }

  redirect(homeFor(profile.role as Role));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
