import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PREFIXES = [
  "/_next",
  "/favicon",
  "/api/auth",
  "/api/health",
  "/api/webhooks",
  "/api/socket",
  "/api/files",
  "/verify",
  "/login",
  "/register",
  "/doctors", // public directory; booking checked server-side
];

const ROLE_RULES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard/clinician", roles: ["doctor"] },
  { prefix: "/dashboard/pharmacy", roles: ["pharmacist"] },
  { prefix: "/dashboard/admin", roles: ["admin"] },
  { prefix: "/consult", roles: ["patient", "doctor"] },
  { prefix: "/book", roles: ["patient"] },
  { prefix: "/dashboard", roles: ["patient", "doctor", "pharmacist", "admin"] },
];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const rule = ROLE_RULES.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  // Auth.js v5 prefixes the session cookie with `__Secure-` only when the
  // request is HTTPS. Detect from the request itself rather than NODE_ENV so
  // local production builds (HTTP) still match.
  const secure = req.nextUrl.protocol === "https:";
  const cookieName = secure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    salt: cookieName,
    cookieName,
    secureCookie: secure,
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = (token as { role?: string }).role;
  if (!role || !rule.roles.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
