import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

  if (!token.role || !rule.roles.includes(token.role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Keep in sync with ROLE_RULES. Everything else is public at this layer, and
// routes outside these paths do their own checks with requireRole().
export const config = {
  matcher: ["/dashboard/:path*", "/consult/:path*", "/book/:path*"],
};
