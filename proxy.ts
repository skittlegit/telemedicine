import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (formerly `middleware.ts` in Next.js ≤15).
 * Coarse role-gating only: any deeper authz happens inside the matching
 * Route Handler / Server Component via `requireSession()` from `lib/authz.ts`.
 *
 * Phase 2 will read the Auth.js v5 session token here. For now, this file
 * exists so subsequent phases can plug in without a routing rewrite.
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public assets, the auth flow itself, the Stripe webhook,
  // the Socket.IO upgrade, and Rx verification links.
  const PUBLIC_PREFIXES = [
    "/_next",
    "/favicon",
    "/api/auth",
    "/api/health",
    "/api/webhooks",
    "/api/socket",
    "/verify",
    "/login",
    "/register",
  ];
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) || pathname === "/") {
    return NextResponse.next();
  }

  // Stub: actual session-based gating wired up in Phase 2.
  return NextResponse.next();
}

export const config = {
  // Run on every request except static files & images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
