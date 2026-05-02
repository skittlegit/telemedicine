"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Minimal editorial chrome for marketing surfaces.
 *
 * Intent: an editorial publication does not have a sticky SaaS header.
 * One slim strip in document flow with the wordmark, a small set of
 * text links, and a single primary action. Mobile drops the inline nav
 * and the footer carries discovery instead.
 */

export function Caduceus({
  size = 18,
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

export function Wordmark({ href = "/" }: { href?: string } = {}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 shrink-0 text-ink hover:text-clay transition-colors"
    >
      <Caduceus className="text-clay" size={16} />
      <span className="font-semibold text-[14.5px] tracking-[-0.012em] leading-none">
        Vellum Health
      </span>
    </Link>
  );
}

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/doctors", label: "Doctors" },
  { href: "/specialties", label: "Specialties" },
  { href: "/pharmacy", label: "Pharmacy" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Slim editorial top strip. Not sticky. About 56px tall.
 * Inline nav at >=md, just wordmark + primary action below.
 */
export function MarketingHeader({
  logoHref = "/",
  authed = false,
  dashboardHref = "/dashboard",
}: {
  logoHref?: string;
  authed?: boolean;
  dashboardHref?: string;
} = {}) {
  const pathname = usePathname();

  return (
    <div className="border-b border-[color:var(--rule)]">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 h-14 flex items-center justify-between gap-6">
        <Wordmark href={logoHref} />

        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {NAV_LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={
                  "text-[13px] tracking-[-0.005em] transition-colors " +
                  (active ? "text-ink" : "text-ink-mute hover:text-ink")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {authed ? (
            <Link
              href={dashboardHref}
              prefetch
              className="text-[13px] text-ink hover:text-clay transition-colors inline-flex items-center gap-1.5"
            >
              Dashboard <span aria-hidden>→</span>
            </Link>
          ) : (
            <Link
              href="/login"
              prefetch
              className="text-[13px] text-ink hover:text-clay transition-colors inline-flex items-center gap-1.5"
            >
              Login <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function MarketingFooter({ logoHref = "/" }: { logoHref?: string } = {}) {
  return (
    <footer className="mt-auto border-t border-[color:var(--rule-strong)] bg-paper-tint">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-14 grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-2 md:col-span-5">
          <Wordmark href={logoHref} />
          <p className="mt-5 text-ink-soft text-[14px] leading-[1.6] max-w-[40ch]">
            A flat-fee video clinic. Encrypted records, signed digital
            prescriptions, same-day pharmacy fulfilment.
          </p>
          <p className="sidenote mt-8">
            <strong>Set in</strong>
            Fraunces, IBM Plex Sans, JetBrains Mono.
          </p>
        </div>
        <div className="md:col-span-2 md:col-start-7">
          <p className="eyebrow mb-4">Practice</p>
          <ul className="space-y-2.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay transition-colors" href="/doctors">Doctors</Link></li>
            <li><Link className="hover:text-clay transition-colors" href="/specialties">Specialties</Link></li>
            <li><Link className="hover:text-clay transition-colors" href="/pharmacy">Pharmacy</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4">About</p>
          <ul className="space-y-2.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay transition-colors" href="/doctors">Practice</Link></li>
            <li><Link className="hover:text-clay transition-colors" href="/pharmacy">Pharmacy</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Account</p>
          <ul className="space-y-2.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay transition-colors" href="/login">Login</Link></li>
            <li><Link className="hover:text-clay transition-colors" href="/register">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-3 eyebrow text-[10.5px] text-ink-mute">
          <span>© Vellum Health · Demo build</span>
          <span>Care, tonight.</span>
        </div>
      </div>
    </footer>
  );
}
