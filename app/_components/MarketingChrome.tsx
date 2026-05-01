"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SPECIALTIES } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Wordmark glyph. Single hairline stroke. Used by both marketing and
 * authenticated chrome — same icon everywhere.
 */
export function Caduceus({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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
 * Compact wordmark used inside any chrome bar.
 */
export function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0 text-ink hover:text-ink"
    >
      <Caduceus className="text-clay" />
      <span className="font-semibold text-[16px] tracking-[-0.012em] leading-none">
        Vellum Health
      </span>
    </Link>
  );
}

const NAV_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  hasMega?: boolean;
}> = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/doctors", label: "Doctors" },
  { href: "/specialties", label: "Care", hasMega: true },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Slim CTA strip above the marketing nav. Dismissable; preference saved to
 * localStorage so it doesn't re-appear after every session.
 */
export function AnnouncementBar() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem("vellum-announce-dismissed") === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  function dismiss() {
    try {
      localStorage.setItem("vellum-announce-dismissed", "1");
    } catch {}
    setHidden(true);
  }
  if (hidden) return null;
  return (
    <div className="announce">
      <span>Same-day video visits — most appointments under 15 minutes.</span>
      <Link href="/register" prefetch>
        Get care →
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M5 5l14 14" />
          <path d="M19 5L5 19" />
        </svg>
      </button>
    </div>
  );
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();
  const closeMegaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMegaOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openMega() {
    if (closeMegaTimer.current) clearTimeout(closeMegaTimer.current);
    setMegaOpen(true);
  }
  function scheduleCloseMega() {
    if (closeMegaTimer.current) clearTimeout(closeMegaTimer.current);
    closeMegaTimer.current = setTimeout(() => setMegaOpen(false), 140);
  }

  return (
    <>
      <AnnouncementBar />
      <header
        className="sticky top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-[color:var(--rule)]"
        onMouseLeave={scheduleCloseMega}
      >
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-6">
          <Wordmark />

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              if (l.hasMega) {
                return (
                  <div
                    key={l.label}
                    className="h-[64px] flex items-center"
                    onMouseEnter={openMega}
                    onFocus={openMega}
                  >
                    <Link
                      href={l.href}
                      prefetch
                      className="nav-link"
                      data-active={active}
                      aria-haspopup="true"
                      aria-expanded={megaOpen}
                    >
                      {l.label}
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </Link>
                  </div>
                );
              }
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  prefetch
                  className="nav-link"
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-1">
            <ThemeToggle />
            <Link href="/login" prefetch className="btn btn-clay btn-sm">
              Login →
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
        </div>

        {/* Mega-menu */}
        {megaOpen && (
          <div
            className="mega-panel hidden md:block"
            onMouseEnter={openMega}
            onMouseLeave={scheduleCloseMega}
          >
            <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-8 grid grid-cols-12 gap-x-8 gap-y-6">
              <div className="col-span-3">
                <p className="eyebrow mb-2">By specialty</p>
                <p className="text-[14px] text-ink-soft leading-[1.6] mb-4">
                  Browse 50+ board-certified specialties. We&apos;ll route you
                  to the right clinician.
                </p>
                <Link
                  href="/specialties"
                  prefetch
                  className="text-[13px] text-clay font-medium hover:underline"
                >
                  See all specialties →
                </Link>
              </div>
              <div className="col-span-9 grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                {SPECIALTIES.slice(0, 9).map((s) => (
                  <Link
                    key={s.name}
                    href={`/specialties/${s.slug}`}
                    prefetch
                    className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-paper-tint transition-colors"
                  >
                    <span className="text-clay shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px] mt-0.5">
                      {s.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium text-ink leading-[1.3]">
                        {s.name}
                      </span>
                      <span className="block text-[12px] text-ink-mute leading-[1.4] mt-0.5 truncate">
                        {s.examples}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-[color:var(--rule)] bg-paper-tint">
              <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3 text-[13px]">
                <p className="text-ink-soft">
                  Not sure where to start?{" "}
                  <Link
                    href="/how-it-works"
                    className="text-clay font-medium hover:underline"
                  >
                    See how it works
                  </Link>
                </p>
                <Link
                  href="/doctors"
                  prefetch
                  className="text-clay font-medium hover:underline"
                >
                  Browse all doctors →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile sheet */}
        {open && (
          <div
            id="marketing-mobile-nav"
            className="md:hidden fixed inset-x-0 top-[64px] bottom-0 z-40 bg-paper border-t border-[color:var(--rule)] overflow-y-auto"
          >
            <nav className="px-5 py-5 flex flex-col">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  prefetch
                  className="text-[16px] py-3 border-b border-[color:var(--rule)] text-ink hover:text-clay transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-6">
                <Link href="/login" prefetch className="btn btn-clay w-full justify-center">
                  Login →
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-between text-[13px] text-ink-mute">
                <span>Theme</span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--rule-strong)]">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Wordmark />
          <p className="mt-4 text-ink-mute text-[13px] leading-[1.6] max-w-[34ch]">
            Encrypted video visits, signed digital prescriptions, same-day
            pharmacy fulfilment.
          </p>
          <p className="mt-4 mono text-[11px] text-ink-faint">
            build · 0.2.0 ·{" "}
            <span className="text-moss">all systems operational</span>
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Care</p>
          <ul className="space-y-2 text-[13.5px] text-ink-soft">
            <li>
              <Link className="hover:text-clay" href="/how-it-works">
                How it works
              </Link>
            </li>
            <li>
              <Link className="hover:text-clay" href="/specialties">
                Specialties
              </Link>
            </li>
            <li>
              <Link className="hover:text-clay" href="/doctors">
                Find a doctor
              </Link>
            </li>
            <li>
              <Link className="hover:text-clay" href="/pricing">
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Patients</p>
          <ul className="space-y-2 text-[13.5px] text-ink-soft">
            <li>
              <Link className="hover:text-clay" href="/register">
                Create account
              </Link>
            </li>
            <li>
              <Link className="hover:text-clay" href="/login">
                Sign in
              </Link>
            </li>
            <li>
              <Link className="hover:text-clay" href="/dashboard">
                Your dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Company</p>
          <ul className="space-y-2 text-[13.5px] text-ink-soft">
            <li>
              <Link className="hover:text-clay" href="/security">
                Security
              </Link>
            </li>
            <li>
              <Link className="hover:text-clay" href="/security#rights">
                Privacy
              </Link>
            </li>
            <li>
              <Link className="hover:text-clay" href="/security#rights">
                Terms
              </Link>
            </li>
          </ul>
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
