import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProfile, homeFor } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Login · Madrasatu Hajiya Hindatu" };

// Already logged in → go to your portal.
async function RedirectIfLoggedIn() {
  const profile = await getProfile();
  if (profile) redirect(homeFor(profile.role));
  return null;
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted px-4 py-10">
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm">
        <Link href="/" className="block text-center">
          <span className="block font-semibold text-primary">Madrasatu Hajiya Hindatu</span>
          <span lang="ar" dir="rtl" className="font-arabic block text-sm text-muted-foreground">
            مدرسة الحاجة هندة
          </span>
        </Link>
        <h1 className="mt-6 mb-4 text-xl font-semibold">Log in</h1>
        <LoginForm />
        <p className="mt-4 text-xs text-muted-foreground">
          Students: use your admission number. Forgot your password? Ask the school office.
        </p>
      </div>
    </main>
  );
}
