import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/authz";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/app/_components/MarketingChrome";

/**
 * Authenticated dashboard layout — uses the same editorial chrome as
 * the marketing surface so logged-in users feel they're on one site,
 * not a different SaaS app. Role-aware navigation lives in the header.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  const u = session.user as { name?: string; role?: string };
  const role = u.role ?? "patient";

  return (
    <div
      className="min-h-screen flex flex-col bg-paper text-ink"
      data-surface="product"
    >
      <MarketingHeader
        authed
        logoHref="/dashboard"
        user={{ name: u.name ?? "User", role }}
      />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-6 lg:px-10 py-10 lg:py-14">
          {children}
        </div>
      </main>
      <MarketingFooter logoHref="/dashboard" />
    </div>
  );
}
