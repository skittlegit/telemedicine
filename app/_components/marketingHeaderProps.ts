import { getSession } from "@/lib/authz";

/**
 * Resolve the props the marketing header needs from the current session.
 * Logged-in users see a "Dashboard →" CTA and the wordmark logo points at
 * their dashboard so clicks don't dump them back to the public landing page.
 */
export async function marketingHeaderProps() {
  const session = await getSession();
  const authed = !!session?.user;
  return {
    authed,
    logoHref: authed ? "/dashboard" : "/",
    dashboardHref: "/dashboard",
  };
}
