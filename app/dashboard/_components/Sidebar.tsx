"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { signOutAction } from "@/app/actions/auth";
import { Wordmark } from "@/app/_components/MarketingChrome";

export interface SidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
  /** When true, only match the exact path; otherwise prefix-match. */
  exact?: boolean;
}
export interface SidebarSection {
  heading: string;
  items: SidebarItem[];
}

function matches(pathname: string, item: SidebarItem) {
  if (item.exact) return pathname === item.href;
  if (pathname === item.href) return true;
  return pathname.startsWith(`${item.href}/`);
}

/**
 * Persistent left rail — `lg+` only. On smaller screens the dashboard uses
 * `MobileBottomNav` instead; there is no slide-in side drawer on mobile.
 */
export function Sidebar({
  user,
  nav,
}: {
  user: { name: string; role: string };
  nav: SidebarSection[];
}) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[240px] bg-paper-tint border-r border-[color:var(--rule)] flex-col"
      aria-label="Primary"
    >
      <div className="h-[64px] px-5 flex items-center border-b border-[color:var(--rule)]">
        <Wordmark href="/dashboard" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {nav.map((section) => (
          <div key={section.heading} className="mb-5">
            <p className="px-3 mb-1.5 eyebrow text-[10px]">
              {section.heading}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = matches(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch
                      className="side-link"
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="[&>svg]:w-[16px] [&>svg]:h-[16px]">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[color:var(--rule)] p-3">
        <div className="px-2 py-2 mb-2">
          <Link
            href="/dashboard"
            className="block text-[13px] font-medium text-ink hover:text-clay leading-tight truncate"
          >
            {user.name}
          </Link>
          <p className="eyebrow text-[10px] mt-0.5">{user.role}</p>
        </div>
        <div className="flex items-center gap-1">
          <form action={signOutAction} className="flex-1">
            <button
              type="submit"
              className="btn btn-ghost btn-sm w-full"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
