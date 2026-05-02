import type { ReactNode } from "react";
import Link from "next/link";

/**
 * @deprecated The dashboard chrome is now provided by `app/dashboard/layout.tsx`
 * (which renders <AppShell>). This export remains as a no-op shim so the
 * existing per-page `<DashboardHeader user={...} />` calls keep compiling
 * during the migration. It can be deleted once every page is cleaned up.
 */
export function DashboardHeader(_props: {
  user: { name: string; role: string };
}) {
  void _props;
  return null;
}

/**
 * Page header. Editorial register: masthead rule + eyebrow + serif-display
 * title with an optional italic-accent fragment. Container padding is
 * supplied by AppShell so this renders inline.
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
    <header className="mb-10">
      <div className="masthead">
        <span>
          <span className="rx-mark" aria-hidden /> {eyebrow}
        </span>
      </div>
      <h1 className="serif-display mt-6 text-[clamp(2rem,4.5vw,3.25rem)] max-w-[22ch]">
        {title}
        {italic && (
          <>
            {" "}
            <span className="italic-accent">{italic}</span>
          </>
        )}
      </h1>
      {children && (
        <div className="mt-5 text-ink-soft text-[14.5px] max-w-[68ch] leading-[1.7]">
          {children}
        </div>
      )}
    </header>
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
      <p className="eyebrow mb-3">{label}</p>
      <p className="serif-section text-[clamp(1.6rem,3vw,2.1rem)] tabular leading-none">
        {value}
      </p>
      {hint && (
        <p className="mono text-[11px] tracking-[0.12em] uppercase text-ink-mute mt-3">
          {hint}
        </p>
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
      className={`grid grid-cols-2 ${colsClass} gap-px bg-[color:var(--rule)] border-y border-[color:var(--rule-strong)]`}
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
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6 pb-3 border-b border-[color:var(--rule-strong)]">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="serif-section text-[clamp(1.25rem,2.4vw,1.6rem)]">
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
    <div className="border-y border-[color:var(--rule)] py-10 text-center">
      <p className="text-ink-mute text-[14px] leading-[1.6] max-w-[48ch] mx-auto">
        {message}
      </p>
      {cta && <div className="mt-5 flex justify-center">{cta}</div>}
    </div>
  );
}

/**
 * Shared license / verification banner for clinician + pharmacy dashboards.
 * Uses the .alert-band primitive: full hairline border, soft tinted bg,
 * status implied by the leading dot. No side-stripe colored borders.
 */
export function LicenseBanner({
  verified,
  verifiedAt,
  manageHref,
}: {
  verified: boolean;
  verifiedAt?: Date;
  manageHref: string;
}) {
  return (
    <div
      className="alert-band mb-10"
      data-tone={verified ? "moss" : "amber"}
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 flex-1">
        <div>
          <p className="eyebrow mb-1 text-[10px]">Licensure</p>
          <p className="text-[13px] text-ink leading-[1.5]">
            {verified && verifiedAt
              ? `Verified by Vellum on ${new Date(verifiedAt).toLocaleDateString()}.`
              : "Pending admin verification. Your account is read-only until approved."}
          </p>
        </div>
        <Link href={manageHref} className="btn btn-ghost btn-sm">
          Manage profile →
        </Link>
      </div>
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
export { Caduceus } from "@/app/_components/MarketingChrome";
