"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { Wordmark } from "@/app/_components/MarketingChrome";
import { ThemeToggle } from "@/app/_components/ThemeToggle";

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
 * Persistent left rail on lg+, slide-in sheet on smaller screens. Active item
 * is determined client-side via usePathname so it survives client navigations
 * without a server round-trip.
 */
export function Sidebar({
  user,
  nav,
}: {
  user: { name: string; role: string };
  nav: SidebarSection[];
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      {/* Mobile trigger lives in Topbar; sheet renders here */}
      <input
        type="checkbox"
        id="sidebar-toggle"
        className="peer hidden"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-paper-tint border-r border-[color:var(--rule)] flex flex-col transform transition-transform lg:transform-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-[240px]`}
        aria-label="Primary"
      >
        <div className="h-[64px] px-5 flex items-center justify-between border-b border-[color:var(--rule)]">
          <Wordmark />
          <button
            type="button"
            aria-label="Close menu"
            className="lg:hidden text-ink-soft hover:text-ink"
            onClick={() => setOpen(false)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M5 5l14 14" />
              <path d="M19 5L5 19" />
            </svg>
          </button>
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
            <p className="text-[13px] font-medium text-ink leading-tight truncate">
              {user.name}
            </p>
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
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}

/**
 * Mobile-only hamburger trigger. Lives inside Topbar so the chrome reads as
 * one bar at small widths. Clicks the hidden `#sidebar-toggle` checkbox via a
 * label; on lg+ Sidebar is statically open and this is hidden.
 */
export function SidebarTrigger() {
  return (
    <label
      htmlFor="sidebar-toggle"
      className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 text-ink cursor-pointer"
      aria-label="Open menu"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    </label>
  );
}
