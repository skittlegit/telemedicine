"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ============================================================
   Editorial chrome — single header used by every surface.
   Public visitors see marketing nav + Login. Logged-in users
   see role-aware product nav + a profile menu where Login was.
   ============================================================ */

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
      viewBox="-1 -1 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Staff */}
      <path d="M12 2v20" />
      {/* Leaf at upper-left — closed almond, snake head */}
      <path d="M12 5C10 3 6 3 6 5.5C6 8 10 8.5 12 7.5" />
      {/* Snake upper-right arc */}
      <path d="M15.5 5.5C18.5 7 18 11 15 12" />
      {/* Snake lower-left arc */}
      <path d="M9 12C6 13.5 6.5 17.5 9.5 18.5" />
      {/* Tail curl right */}
      <path d="M13.5 18.5C16.5 19.5 16.5 22 14 22" />
    </svg>
  );
}

export function Wordmark({ href = "/" }: { href?: string } = {}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 shrink-0 text-ink hover:text-clay transition-colors"
    >
      <span
        className="inline-flex items-center justify-center text-clay"
        aria-hidden
        style={{ width: 22, height: 22, overflow: "visible" }}
      >
        <Caduceus size={18} />
      </span>
      <span
        className="text-[18px] tracking-[-0.018em] leading-none"
        style={{
          fontFamily: "var(--font-fraunces), 'Times New Roman', serif",
          fontVariationSettings: '"opsz" 96, "SOFT" 50',
          fontWeight: 500,
        }}
      >
        Vellum Health
      </span>
    </Link>
  );
}

export type NavLink = { href: string; label: string; exact?: boolean };

const PUBLIC_NAV: ReadonlyArray<NavLink> = [
  { href: "/doctors", label: "Doctors" },
  { href: "/specialties", label: "Specialties" },
  { href: "/pharmacy", label: "Pharmacy" },
];

/**
 * Role -> primary nav links shown in the top strip.
 */
export const PRODUCT_NAV_BY_ROLE: Record<string, ReadonlyArray<NavLink>> = {
  patient: [
    { href: "/dashboard", label: "Today", exact: true },
    { href: "/doctors", label: "Doctors" },
    { href: "/pharmacy", label: "Pharmacy" },
    { href: "/dashboard/visits", label: "Visits & Rx" },
    { href: "/dashboard/orders", label: "Orders" },
  ],
  doctor: [
    { href: "/dashboard", label: "Today", exact: true },
    { href: "/dashboard/clinician/schedule", label: "Schedule" },
    { href: "/dashboard/clinician/prescriptions", label: "Prescriptions" },
  ],
  pharmacist: [
    { href: "/dashboard/pharmacy", label: "Queue", exact: true },
    { href: "/dashboard/pharmacy/active", label: "Active" },
    { href: "/dashboard/pharmacy/listings", label: "Listings" },
    { href: "/dashboard/pharmacy/history", label: "History" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", exact: true },
    { href: "/dashboard/admin/approvals", label: "Approvals" },
    { href: "/dashboard/admin/roster", label: "Roster" },
    { href: "/dashboard/admin/audit", label: "Audit" },
  ],
};

function isActive(pathname: string | null, link: NavLink) {
  if (!pathname) return false;
  if (link.exact) return pathname === link.href;
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

function profileHrefFor(role: string) {
  if (role === "doctor") return "/dashboard/clinician/profile";
  if (role === "pharmacist") return "/dashboard/pharmacy/profile";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/profile";
}

function ProfileLink({ user }: { user: { name: string; role: string } }) {
  const initial = (user.name?.[0] ?? "?").toUpperCase();
  const profileHref = profileHrefFor(user.role);
  return (
    <Link
      href={profileHref}
      prefetch
      aria-label={`Open profile for ${user.name}`}
      className="flex items-center gap-2 group"
    >
      <span
        className="grid place-items-center h-8 w-8 bg-clay-wash text-clay text-[12px] font-semibold tracking-[-0.01em] ring-1 ring-inset ring-[color:var(--rule-strong)] group-hover:ring-clay/40 transition-shadow"
        aria-hidden
      >
        {initial}
      </span>
      <span
        className="hidden sm:inline text-[15px] text-ink group-hover:text-clay transition-colors leading-none"
        style={{
          fontFamily: "var(--font-fraunces), 'Times New Roman', serif",
          fontVariationSettings: '"opsz" 96, "SOFT" 50',
          fontWeight: 500,
        }}
      >
        {user.name.split(" ")[0]}
      </span>
    </Link>
  );
}

// Suppress unused-import warning when UserMenu is removed.


export function MarketingHeader({
  logoHref = "/",
  authed = false,
  user,
  navOverride,
}: {
  logoHref?: string;
  authed?: boolean;
  user?: { name: string; role: string };
  navOverride?: ReadonlyArray<NavLink>;
} = {}) {
  const pathname = usePathname();

  const links: ReadonlyArray<NavLink> =
    navOverride ??
    (authed && user
      ? PRODUCT_NAV_BY_ROLE[user.role] ?? PRODUCT_NAV_BY_ROLE.patient
      : PUBLIC_NAV);

  return (
    <div className="border-b border-[color:var(--rule)] bg-paper">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 h-14 flex items-center justify-between gap-6">
        <Wordmark href={logoHref} />

        <nav
          className="hidden md:flex items-center gap-7 overflow-x-auto"
          aria-label="Primary"
        >
          {links.map((l) => {
            const active = isActive(pathname, l);
            return (
              <Link
                key={l.href}
                href={l.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={
                  "text-[13px] tracking-[-0.005em] transition-colors whitespace-nowrap " +
                  (active ? "text-ink" : "text-ink-mute hover:text-ink")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          {authed && user ? (
            <ProfileLink user={user} />
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

      {/* Mobile nav row — only meaningful when authed (multi-link surface) */}
      {authed && links.length > 1 && (
        <div className="md:hidden border-t border-[color:var(--rule)] overflow-x-auto">
          <nav
            className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 flex items-center gap-5 h-11"
            aria-label="Primary mobile"
          >
            {links.map((l) => {
              const active = isActive(pathname, l);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "text-[12.5px] tracking-[-0.005em] whitespace-nowrap transition-colors " +
                    (active ? "text-ink" : "text-ink-mute hover:text-ink")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
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
          <p className="eyebrow mb-4">Account</p>
          <ul className="space-y-2.5 text-[13.5px] text-ink-soft">
            <li><Link className="hover:text-clay transition-colors" href="/login">Login</Link></li>
            <li><Link className="hover:text-clay transition-colors" href="/register">Register</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Care, tonight.</p>
          <p className="text-[13px] text-ink-mute leading-[1.6]">
            Encrypted video. Signed prescriptions. Verified pharmacies.
          </p>
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
