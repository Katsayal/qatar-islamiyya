import { NextResponse, type NextRequest } from "next/server";
import { publicRoute } from "@/lib/lang";
import { updateSession } from "@/lib/supabase/proxy";

// 1. Public pages: plain URLs are served by the English pages (/about → /en/about), /en/… redirects to the plain URL.
// 2. Every request: refresh the Supabase session cookie, keep logged-out users out of /portal.
export function proxy(request: NextRequest) {
  const route = publicRoute(request.nextUrl.pathname);
  if (route?.action === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = route.to;
    return NextResponse.redirect(url, 308);
  }
  const rewriteTo = route ? new URL(route.to + request.nextUrl.search, request.url) : undefined;
  return updateSession(request, rewriteTo);
}

export const config = {
  // Skip static files and images
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
