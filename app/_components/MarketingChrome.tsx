"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Wordmark glyph. Single hairline stroke so it composes with the Inter
 * wordmark next to it without visual clash. Used by both marketing and
 * authenticated chrome — same icon everywhere.
 */
export function Caduceus({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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

/**
 * Compact wordmark used inside any chrome bar. No italic accent — the home
 * and the dashboard both render this exact element so they read as the same
 * site.
 */
export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0 text-ink hover:text-ink">
      <Caduceus className="text-clay" />
      <span className="font-semibold text-[15px] tracking-[-0.01em] leading-none">
        Vellum<span className="text-ink-mute font-normal"> · Health</span>
      </span>
    </Link>
  );
}

const MARKETING_LINKS: ReadonlyArray<readonly [string, string]> = [
  ["/doctors", "Doctors"],
  ["/how-it-works", "How it works"],
  ["/specialties", "Specialties"],
  ["/security", "Security"],
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile sheet on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile sheet is open. Cheap CSS-only solution
  // that doesn't fight the browser's URL-bar behavior.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <header className="border-b border-[color:var(--rule)] bg-paper/90 backdrop-blur-[2px] sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-3">
        <Wordmark />

        <nav className="hidden md:flex items-center gap-7 text-[13px] text-ink-soft">
          {MARKETING_LINKS.map(([href, label]) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className={`transition-colors hover:text-ink ${active ? "text-ink" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          <Link href="/login" prefetch className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/register" prefetch className="btn btn-clay btn-sm">
            Create account
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="marketing-mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
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

      {open && (
        <div
          id="marketing-mobile-nav"
          className="sm:hidden border-t border-[color:var(--rule)] bg-paper"
        >
          <nav className="px-5 py-3 flex flex-col">
            {MARKETING_LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                prefetch
                className="text-[15px] py-2.5 border-b border-[color:var(--rule)] last:border-b-0 text-ink hover:text-clay transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/login" prefetch className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link href="/register" prefetch className="btn btn-clay btn-sm">
                Create account
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--rule-strong)]">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Wordmark />
          <p className="mt-4 text-ink-mute text-[13px] leading-[1.6] max-w-[34ch]">
            Telemedicine, properly. Encrypted video, signed prescriptions, licensed clinicians.
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
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-2 eyebrow text-[10.5px]">
          <span>© 2026 Vellum Health</span>
          <span>Portfolio implementation. Not a real medical service.</span>
        </div>
      </div>
    </footer>
  );
}
