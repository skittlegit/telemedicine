import type { ReactNode } from "react";
import Link from "next/link";
import { Sidebar, type SidebarSection } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Wordmark } from "@/app/_components/MarketingChrome";

/**
 * Authenticated app shell. Persistent left sidebar (240px, lg+) + top breadcrumb
 * bar. Wraps every /dashboard page that is not `/consult` (which is full-bleed).
 *
 * Server component — receives nav items already computed for the role from the
 * layout. Active state is highlighted by the (client) Sidebar via usePathname.
 */
export function AppShell({
  user,
  nav,
  children,
}: {
  user: { name: string; role: string };
  nav: SidebarSection[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink flex">
      <Sidebar user={user} nav={nav} />
      <div className="flex-1 min-w-0 flex flex-col lg:ml-[240px]">
        <Topbar user={user} nav={nav} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-6 lg:px-10 py-8 lg:py-10">
            {children}
          </div>
        </main>
        <footer className="border-t border-[color:var(--rule)] mt-auto">
          <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-2 eyebrow text-[10.5px]">
            <Link href="/" className="hover:text-clay">
              <Wordmark />
            </Link>
            <span>© 2026 Vellum Health</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
