import type { Metadata } from "next";
import Image from "next/image";
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
    <main className="pattern-star flex flex-1 flex-col items-center justify-center bg-deep px-4 py-10">
      <Suspense fallback={null}>
        <RedirectIfLoggedIn />
      </Suspense>
      <div className="w-full max-w-sm rounded-2xl border-t-4 border-t-gold bg-card p-6 shadow-xl md:p-8">
        <Link href="/" className="flex flex-col items-center text-center">
          <Image src="/logo.svg" alt="" width={80} height={80} priority className="size-20" />
          <span className="mt-3 block font-semibold text-primary">Madrasatu Hajiya Hindatu</span>
          <span lang="ar" dir="rtl" className="font-arabic block text-sm text-muted-foreground">
            مدرسة الحاجة هندة
          </span>
        </Link>
        <h1 className="mt-6 mb-1 text-2xl font-semibold">Welcome back</h1>
        <p className="mb-5 text-sm text-muted-foreground">Log in to your school portal.</p>
        <LoginForm />
        <p className="mt-5 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
          Students: use your admission number. Forgot your password? Ask the school office.
        </p>
      </div>
      <Link href="/" className="mt-6 text-sm text-white/80 hover:text-gold">
        ← Back to the website
      </Link>
    </main>
  );
}
