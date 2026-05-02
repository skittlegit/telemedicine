import { getSession } from "@/lib/authz";

/**
 * Resolve props for MarketingHeader from the current session.
 * Logged-in users get role-aware nav (via PRODUCT_NAV_BY_ROLE in
 * MarketingChrome) and a profile menu where the Login link sat.
 */
export async function marketingHeaderProps() {
  const session = await getSession();
  const u = session?.user as { name?: string; role?: string } | undefined;
  const authed = !!u;
  return {
    authed,
    logoHref: authed ? "/dashboard" : "/",
    user: authed
      ? { name: u?.name ?? "User", role: u?.role ?? "patient" }
      : undefined,
  };
}
