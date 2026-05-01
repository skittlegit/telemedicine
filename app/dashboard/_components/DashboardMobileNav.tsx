"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

interface MobileNavProps {
  links: ReadonlyArray<{ href: string; label: string }>;
  user: { name: string; role: string };
}

/**
 * Authenticated mobile sheet. Matches MarketingHeader's mobile sheet exactly
 * (no animated AnimatePresence, plain conditional render — the previous
 * motion-wrapped version added jank to every menu open). Closes on route
 * change; locks scroll while open.
 */
export function DashboardMobileNav({ links, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-ink"
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
          {open ? (
            <>
              <path d="M5 5l14 14" />
              <path d="M19 5L5 19" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-x-0 top-[56px] bottom-0 z-40 bg-paper border-t border-[color:var(--rule)] overflow-y-auto">
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-1.5 py-0.5 border border-[color:var(--rule-strong)] bg-paper-tint text-clay text-[10.5px] tracking-[0.14em] uppercase font-medium">
                {user.role}
              </span>
              <span className="text-[13px] text-ink-soft truncate">
                {user.name}
              </span>
            </div>
            <nav className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  prefetch
                  className="text-[15px] py-2.5 border-b border-[color:var(--rule)] last:border-b-0 text-ink hover:text-clay transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <form action={signOutAction} className="mt-5">
              <button type="submit" className="btn btn-ghost btn-sm w-full">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
