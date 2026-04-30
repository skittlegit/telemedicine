import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/lib/models/User";

export type Session = NonNullable<Awaited<ReturnType<typeof auth>>>;

/** Server-side: get the current session or null. */
export async function getSession() {
  return auth();
}

/** Redirects to /login if no session. Returns the session otherwise. */
export async function requireSession() {
  const s = await auth();
  if (!s?.user) redirect("/login");
  return s;
}

/** Redirects with a clear error if the role doesn't match. */
export async function requireRole(...roles: Role[]) {
  const s = await requireSession();
  const role = (s.user as { role?: Role }).role;
  if (!role || !roles.includes(role)) {
    // User is signed in but lacks permission — bouncing to /login would loop
    // (callbackUrl would send them right back). Send to /dashboard with a flash.
    redirect("/dashboard?forbidden=1");
  }
  return s;
}
