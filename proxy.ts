import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/register"];

// auth() uses JWT only (no PrismaAdapter) — safe to run in this context.
export default auth(function proxy(
  req: NextRequest & { auth: { user?: { role?: string } } | null }
) {
  const { pathname } = req.nextUrl;

  // Allow public paths through without auth check
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes — redirect non-admins to dashboard
  if (pathname.startsWith("/admin")) {
    if (req.auth.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};
