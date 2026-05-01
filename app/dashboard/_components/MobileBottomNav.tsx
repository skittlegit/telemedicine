"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarItem, SidebarSection } from "./Sidebar";

function matches(pathname: string, item: SidebarItem) {
  if (item.exact) return pathname === item.href;
  if (pathname === item.href) return true;
  return pathname.startsWith(`${item.href}/`);
}

function MoreIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </svg>
  );
}

/**
 * Fixed bottom navigation, mobile/tablet only (`< lg`). Picks the first
 * 4 items of the first nav section as primary destinations, plus a
 * "More" button that opens the existing sidebar sheet via the hidden
 * `#sidebar-toggle` checkbox. Respects iOS safe-area insets.
 */
export function MobileBottomNav({ nav }: { nav: SidebarSection[] }) {
  const pathname = usePathname() ?? "";
  const primary = (nav[0]?.items ?? []).slice(0, 4);

  // Anything in the nav not in the primary 4 is reachable via "More"
  const moreItems = nav.flatMap((s) => s.items).slice(primary.length);
  const moreActive = moreItems.some((i) => matches(pathname, i));

  return (
    <nav
      aria-label="Primary mobile"
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-paper/95 backdrop-blur-md border-t border-[color:var(--rule)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 h-[60px]">
        {primary.map((item) => {
          const active = matches(pathname, item);
          return (
            <li key={item.href} className="contents">
              <Link
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 text-[10.5px] tracking-[0.02em] transition-colors"
                data-active={active}
                style={{
                  color: active ? "var(--clay)" : "var(--ink-mute)",
                }}
              >
                <span
                  className="[&>svg]:w-[22px] [&>svg]:h-[22px]"
                  aria-hidden
                >
                  {item.icon}
                </span>
                <span className="leading-none truncate max-w-full px-1">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="contents">
          <label
            htmlFor="sidebar-toggle"
            className="flex flex-col items-center justify-center gap-0.5 text-[10.5px] tracking-[0.02em] cursor-pointer transition-colors"
            style={{
              color: moreActive ? "var(--clay)" : "var(--ink-mute)",
            }}
            aria-label="Open more menu"
          >
            <span
              className="[&>svg]:w-[22px] [&>svg]:h-[22px]"
              aria-hidden
            >
              <MoreIcon />
            </span>
            <span className="leading-none">More</span>
          </label>
        </li>
      </ul>
    </nav>
  );
}
