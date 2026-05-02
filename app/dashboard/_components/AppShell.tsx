import type { ReactNode } from "react";
import { Sidebar, type SidebarSection } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Wordmark } from "@/app/_components/MarketingChrome";

/**
 * Authenticated app shell. Persistent left sidebar (240px, lg+) + top breadcrumb
 * bar. On mobile/tablet, primary navigation is a fixed bottom bar; the sidebar
 * sheet is still reachable via the "More" tab.
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
    <div
      className="min-h-screen bg-paper text-ink flex"
      data-surface="product"
    >
      <Sidebar user={user} nav={nav} />
      <div className="flex-1 min-w-0 flex flex-col lg:ml-[240px]">
        <Topbar user={user} nav={nav} />
        <main className="flex-1 pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-6 lg:px-10 py-8 lg:py-12">
            {children}
          </div>
        </main>
        <footer className="hidden lg:block border-t border-[color:var(--rule)] mt-auto">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-3 eyebrow text-[10.5px] text-ink-mute">
            <Wordmark href="/dashboard" />
            <span className="mono">Vellum Health · Internal</span>
          </div>
        </footer>
      </div>
      <MobileBottomNav nav={nav} user={user} />
    </div>
  );
}
