"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

export function Caduceus({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v18" />
      <path d="M9 8h6" />
      <path d="M8 5c-1 1.5-1 3 0 4.5s2.5 2 2.5 3.5-1 2.5-2.5 2.5" />
      <path d="M16 5c1 1.5 1 3 0 4.5s-2.5 2-2.5 3.5 1 2.5 2.5 2.5" />
      <path d="M5 6.5c1.5 0 2.5-1 2.5-2 0-.5-.3-1-1-1" />
    </svg>
  );
}

const NAV_LINKS: ReadonlyArray<readonly [string, string]> = [
  ["/doctors", "Find a doctor"],
  ["/how-it-works", "How it works"],
  ["/specialties", "Specialties"],
  ["/security", "Security"],
];

export function MarketingHeader() {
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
    <header className="border-b border-[color:var(--rule)] bg-paper/85 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <Caduceus className="text-clay" />
          <span className="font-display text-[20px] sm:text-[24px] tracking-[-0.02em] leading-none">
            Vellum<span className="italic-accent"> Health</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-9 eyebrow">
          {NAV_LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-clay transition-colors" prefetch>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-3 lg:gap-4">
          <Link href="/login" className="eyebrow hover:text-clay transition-colors" prefetch>
            Sign in
          </Link>
          <Link href="/register" className="btn btn-clay" prefetch>
            Get care
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-ink"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
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
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="sm:hidden border-t border-[color:var(--rule)] bg-paper"
          >
            <motion.nav
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
              className="px-5 py-4 flex flex-col"
            >
              {NAV_LINKS.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  prefetch
                  className="font-display text-[1.6rem] tracking-[-0.02em] py-2.5 border-b border-[color:var(--rule)] last:border-b-0 hover:text-clay transition-colors"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-5 flex flex-col gap-3">
                <Link href="/login" prefetch className="btn btn-ghost justify-center">
                  Sign in
                </Link>
                <Link href="/register" prefetch className="btn btn-clay justify-center">
                  Get care →
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--rule-strong)]">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5">
            <Caduceus className="text-clay" />
            <span className="font-display text-[22px] tracking-[-0.02em] leading-none">
              Vellum<span className="italic-accent"> Health</span>
            </span>
          </Link>
          <p className="mt-4 text-ink-mute text-[13px] leading-[1.65] max-w-[34ch]">
            Telemedicine done with care. Encrypted, signed, licensed.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Patients</p>
          <ul className="space-y-1.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay" href="/register">Create account</Link></li>
            <li><Link className="hover:text-clay" href="/doctors">Find a doctor</Link></li>
            <li><Link className="hover:text-clay" href="/dashboard">Your records</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Learn</p>
          <ul className="space-y-1.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay" href="/how-it-works">How it works</Link></li>
            <li><Link className="hover:text-clay" href="/specialties">Specialties</Link></li>
            <li><Link className="hover:text-clay" href="/security">Security</Link></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="eyebrow mb-3">Status</p>
          <p className="mono text-[12px] text-ink-mute leading-[1.7]">
            build · 0.1.0<br />
            status · <span className="text-moss">all systems operational</span>
          </p>
        </div>
      </div>
      <div className="border-t border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-2 eyebrow text-[10.5px]">
          <span>© 2026 Vellum Health · all rights reserved</span>
          <span>Portfolio implementation. Not a real medical service.</span>
        </div>
      </div>
    </footer>
  );
}
