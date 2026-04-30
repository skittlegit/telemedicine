"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { signOutAction } from "@/app/actions/auth";

interface MobileNavProps {
  links: ReadonlyArray<{ href: string; label: string }>;
  user: { name: string; role: string };
}

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

      <AnimatePresence>
        {open && (
          <motion.div
            key="dash-mobile-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-paper border-t border-[color:var(--rule)] overflow-y-auto"
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
              className="px-5 py-5"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="px-2 py-0.5 border border-[color:var(--rule-strong)] bg-paper-tint text-clay eyebrow">
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
                    className="font-display text-[1.5rem] tracking-[-0.02em] py-2.5 border-b border-[color:var(--rule)] hover:text-clay transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <form action={signOutAction} className="mt-6">
                <button
                  type="submit"
                  className="btn btn-ghost justify-center w-full"
                >
                  Sign out
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
