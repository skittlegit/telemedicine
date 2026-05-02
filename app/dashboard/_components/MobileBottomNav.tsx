"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import type { SidebarItem, SidebarSection } from "./Sidebar";

function matches(pathname: string, item: SidebarItem) {
  if (item.exact) return pathname === item.href;
  if (pathname === item.href) return true;
  return pathname.startsWith(`${item.href}/`);
}

function MoreIcon() {
  return (
    <svg
      width="22"
      height="22"
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
 * Fixed bottom navigation, mobile/tablet only (`< lg`). Picks the first 4
 * items of the first nav section as primary destinations, plus a "More"
 * button that opens a bottom sheet with the remaining items + sign-out.
 * Respects iOS safe-area insets.
 */
export function MobileBottomNav({
  nav,
  user,
}: {
  nav: SidebarSection[];
  user: { name: string; role: string };
}) {
  const pathname = usePathname() ?? "";
  const primary = (nav[0]?.items ?? []).slice(0, 4);
  const overflow = nav.flatMap((s) => s.items).slice(primary.length);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    setSheet(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (sheet) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [sheet]);

  const moreActive = overflow.some((i) => matches(pathname, i));

  return (
    <>
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
            <button
              type="button"
              onClick={() => setSheet(true)}
              aria-haspopup="dialog"
              aria-expanded={sheet}
              className="flex flex-col items-center justify-center gap-0.5 text-[10.5px] tracking-[0.02em] cursor-pointer transition-colors"
              style={{
                color: moreActive ? "var(--clay)" : "var(--ink-mute)",
              }}
            >
              <span aria-hidden>
                <MoreIcon />
              </span>
              <span className="leading-none">More</span>
            </button>
          </li>
        </ul>
      </nav>

      {sheet && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-ink/40"
            onClick={() => setSheet(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="More navigation"
            className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-paper border-t border-[color:var(--rule-strong)] pb-[env(safe-area-inset-bottom)] max-h-[80vh] overflow-y-auto rounded-t-xl"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.012em] truncate">
                  {user.name}
                </p>
                <p className="eyebrow text-[10px] mt-0.5">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setSheet(false)}
                aria-label="Close"
                className="w-9 h-9 inline-flex items-center justify-center text-ink-soft hover:text-ink"
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

            <nav className="px-3 py-2">
              {nav.map((section) => (
                <div key={section.heading} className="mb-4">
                  <p className="px-3 mb-1 eyebrow text-[10px]">
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
                            <span className="[&>svg]:w-[18px] [&>svg]:h-[18px]">
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

            <div className="border-t border-[color:var(--rule)] px-5 py-4 flex items-center gap-2">
              <form action={signOutAction} className="flex-1">
                <button type="submit" className="btn btn-ghost btn-sm w-full">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
