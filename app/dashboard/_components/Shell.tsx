import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions/auth";
import { Wordmark, Caduceus as MarkCaduceus } from "@/app/_components/MarketingChrome";
import { DashboardMobileNav } from "./DashboardMobileNav";

/**
 * Authenticated chrome. Identical visual frame to MarketingHeader so /dashboard
 * doesn't read as a different product from /. Only the nav list and the
 * right-side cluster change (role badge + sign out instead of sign in /
 * register CTAs).
 */

const NAV: Record<string, Array<{ href: string; label: string }>> = {
  patient: [
    { href: "/dashboard", label: "Overview" },
    { href: "/doctors", label: "Find a doctor" },
    { href: "/dashboard#prescriptions", label: "Records" },
  ],
  doctor: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard#schedule", label: "Schedule" },
    { href: "/dashboard#rx", label: "Prescriptions" },
    { href: "/dashboard/clinician/profile", label: "Profile" },
  ],
  pharmacist: [
    { href: "/dashboard/pharmacy", label: "Queue" },
    { href: "/dashboard/pharmacy#mine", label: "In progress" },
    { href: "/dashboard/pharmacy/profile", label: "Profile" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin#approvals", label: "Approvals" },
    { href: "/dashboard/admin#clinicians", label: "Clinicians" },
    { href: "/dashboard/admin#audit", label: "Audit" },
  ],
};

export function DashboardHeader({
  user,
}: {
  user: { name: string; role: string };
}) {
  const links = NAV[user.role] ?? [];
  return (
    <header className="border-b border-[color:var(--rule)] bg-paper/90 backdrop-blur-[2px] sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-3 sm:gap-6">
        <Wordmark />
        <nav className="hidden md:flex items-center gap-7 text-[13px] text-ink-soft">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              prefetch
              className="hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-2 text-[12px] text-ink-mute">
            <span className="px-1.5 py-0.5 border border-[color:var(--rule-strong)] bg-paper-tint text-clay text-[10.5px] tracking-[0.14em] uppercase font-medium">
              {user.role}
            </span>
            <span className="hidden lg:inline text-ink-soft">{user.name}</span>
          </span>
          <form action={signOutAction} className="hidden md:block">
            <button type="submit" className="btn btn-ghost btn-sm">
              Sign out
            </button>
          </form>
          <DashboardMobileNav links={links} user={user} />
        </div>
      </div>
    </header>
  );
}

/**
 * Page header. Tightened from the prior editorial-clamp 4.5rem H1 to a
 * clinical text-3xl (~30px). Inter, not Fraunces. The serif moment is now
 * opt-in only via .serif-display on individual marketing pages.
 */
export function PageHeader({
  eyebrow,
  title,
  italic,
  children,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6">
      <p className="eyebrow mb-2.5">{eyebrow}</p>
      <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.022em] leading-[1.15]">
        {title}
        {italic && <span className="text-ink-mute font-normal"> {italic}</span>}
      </h1>
      {children && (
        <div className="mt-4 text-ink-soft text-[14px] max-w-[68ch] leading-[1.55]">
          {children}
        </div>
      )}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-paper px-5 py-4">
      <p className="eyebrow mb-2 text-[10.5px]">{label}</p>
      <p className="text-[26px] leading-none tracking-[-0.018em] font-semibold">
        {value}
      </p>
      {hint && (
        <p className="text-[12px] text-ink-mute mt-1.5 leading-[1.45]">{hint}</p>
      )}
    </div>
  );
}

export function StatGrid({
  children,
  cols = 4,
}: {
  children: ReactNode;
  cols?: 3 | 4 | 5;
}) {
  const colsClass =
    cols === 5
      ? "lg:grid-cols-5"
      : cols === 4
        ? "lg:grid-cols-4"
        : "lg:grid-cols-3";
  return (
    <div
      className={`grid grid-cols-2 ${colsClass} gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]`}
    >
      {children}
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  action,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4 pb-2 border-b border-[color:var(--rule)]">
        <div>
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h2 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.014em] leading-[1.2]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  message,
  cta,
}: {
  message: string;
  cta?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-[color:var(--rule-strong)] rounded-sm p-8 text-center">
      <p className="text-ink-mute text-sm">{message}</p>
      {cta && <div className="mt-4 flex justify-center">{cta}</div>}
    </div>
  );
}

const PILL_TONES: Record<
  string,
  { fg: string; bg: string; border: string; dot: string }
> = {
  moss: {
    fg: "text-moss",
    bg: "bg-moss/10",
    border: "border-moss/40",
    dot: "bg-moss",
  },
  amber: {
    fg: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/40",
    dot: "bg-amber",
  },
  oxblood: {
    fg: "text-oxblood",
    bg: "bg-oxblood/10",
    border: "border-oxblood/40",
    dot: "bg-oxblood",
  },
  clay: {
    fg: "text-clay",
    bg: "bg-clay-wash",
    border: "border-clay/30",
    dot: "bg-clay",
  },
};

function pillTone(status: string): keyof typeof PILL_TONES {
  if (
    status === "delivered" ||
    status === "active" ||
    status === "completed" ||
    status === "fulfilled"
  )
    return "moss";
  if (
    status === "out_for_delivery" ||
    status === "preparing" ||
    status === "claimed" ||
    status === "in_progress" ||
    status === "scheduled" ||
    status === "pending"
  )
    return "amber";
  if (
    status === "cancelled" ||
    status === "disabled" ||
    status === "no_show" ||
    status === "revoked"
  )
    return "oxblood";
  return "clay";
}

export function StatusPill({ status }: { status: string }) {
  const t = PILL_TONES[pillTone(status)];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${t.border} ${t.bg} ${t.fg} text-[10.5px] tracking-[0.14em] uppercase font-medium rounded-sm`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

/**
 * Re-export the shared Caduceus icon. Kept as a named export from this module
 * so existing imports (`import { Caduceus } from "@/app/dashboard/_components/Shell"`)
 * keep compiling without per-file edits.
 */
export const Caduceus = MarkCaduceus;
