import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions/auth";
import { DashboardMobileNav } from "./DashboardMobileNav";

/**
 * Shared chrome for every authenticated page so the dashboards read as part
 * of the same product as the marketing home (same wordmark, same nav style,
 * same warm-bone + plum-violet tokens).
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
    <header className="border-b border-[color:var(--rule)] bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <Caduceus className="text-clay" />
          <span className="font-display text-[20px] sm:text-[24px] tracking-[-0.02em] leading-none">
            Vellum<span className="italic-accent"> Health</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 eyebrow">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="hover:text-clay transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 eyebrow text-ink-soft">
            <span className="px-2 py-0.5 border border-[color:var(--rule-strong)] bg-paper-tint text-clay">
              {user.role}
            </span>
            <span className="hidden lg:inline">{user.name}</span>
          </span>
          <form action={signOutAction} className="hidden md:block">
            <button type="submit" className="btn btn-ghost text-xs">
              Sign out
            </button>
          </form>
          <DashboardMobileNav links={links} user={user} />
        </div>
      </div>
    </header>
  );
}

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
    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-8 sm:pb-10">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="font-display text-[clamp(2rem,7vw,4.5rem)] tracking-[-0.03em] leading-[1.02] break-words">
        {title}
        {italic && (
          <>
            {" "}
            <span className="italic-accent">{italic}</span>
          </>
        )}
      </h1>
      {children && <div className="mt-5 text-ink-soft text-[15px]">{children}</div>}
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
    <div className="bg-paper px-5 py-5">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-display text-[2rem] leading-none tracking-[-0.02em]">
        {value}
      </p>
      {hint && (
        <p className="text-[12px] text-ink-mute mt-2 leading-[1.45]">{hint}</p>
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
    <section id={id} className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] tracking-[-0.02em] leading-[1.05]">
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
    <div className="border border-dashed border-[color:var(--rule-strong)] p-8 text-center">
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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${t.border} ${t.bg} ${t.fg} eyebrow`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Caduceus({
  className = "",
  size = 26,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M216,79v1a40,40,0,0,1-40,40H136v80h8a16,16,0,0,0,10.67-27.93,8,8,0,0,1,10.66-11.92A32,32,0,0,1,144,216h-8v16a8,8,0,0,1-16,0V216H96a8,8,0,0,1,0-16h24V120H96a16,16,0,0,0,0,32,8,8,0,0,1,0,16,32,32,0,0,1,0-64h24V24a8,8,0,0,1,16,0v80h40a24,24,0,0,0,24-24V79a23,23,0,0,0-23-23H160a8,8,0,0,1,0-16h17a39,39,0,0,1,39,39ZM56,96H32a8,8,0,0,1-8-8V80A40,40,0,0,1,64,40H96a8,8,0,0,1,0,16A40,40,0,0,1,56,96ZM80,56H64A24,24,0,0,0,40,80H56A24,24,0,0,0,80,56Z" />
    </svg>
  );
}
