import Link from "next/link";
import { StatusPill } from "@/app/dashboard/_components/Shell";

export const JOIN_WINDOW_MS = 15 * 60 * 1000;

export interface ApptRow {
  _id: string;
  startAt: Date;
  endAt: Date;
  status: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
}

export interface RxRow {
  _id: string;
  issuedAt: Date;
  drugs: Array<{ name: string }>;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  fulfilledAt?: Date;
  revokedAt?: Date;
}

export interface OrderRow {
  _id: string;
  status: string;
  createdAt: Date;
  prescription: string;
}

export function relativeWhen(d: Date): string {
  const ms = d.getTime() - Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (ms < 0) return "started";
  if (ms < 60 * 60 * 1000)
    return `in ${Math.max(1, Math.round(ms / 60000))} min`;
  if (ms < day)
    return `today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (ms < 2 * day)
    return `tomorrow, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  return d.toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

/**
 * Single appointment row used in every list view (patient + clinician). Lifted
 * out of `app/dashboard/page.tsx` so the new sub-routes can share it without
 * cyclic imports.
 */
export function ApptRowItem({
  appt,
  as,
}: {
  appt: ApptRow;
  as: "patient" | "doctor";
}) {
  const startAt = new Date(appt.startAt);
  const inJoinWindow =
    Date.now() >= startAt.getTime() - JOIN_WINDOW_MS &&
    Date.now() <= new Date(appt.endAt).getTime() &&
    (appt.status === "scheduled" || appt.status === "in_progress");
  return (
    <li className="px-4 py-3 flex flex-wrap justify-between items-center gap-3">
      <div>
        <p className="font-medium">
          {as === "patient" ? `Dr. ${appt.doctor.name}` : appt.patient.name}
        </p>
        <p className="mono text-[11px] text-ink-mute mt-0.5">
          {startAt.toLocaleString()} · {relativeWhen(startAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={appt.status} />
        {inJoinWindow && (
          <Link href={`/consult/${appt._id}`} className="btn btn-clay text-xs">
            {as === "doctor" ? "Start consult →" : "Join →"}
          </Link>
        )}
        {as === "doctor" && appt.status === "scheduled" && (
          <Link
            href={`/dashboard/clinician/prescribe/${appt._id}`}
            className="btn btn-ghost text-xs"
          >
            Issue Rx
          </Link>
        )}
      </div>
    </li>
  );
}

/**
 * Compact "next consultation" card used on the patient overview. Extracted so
 * the slimmed `/dashboard` page can render it without duplicating logic.
 */
export function NextConsultationCard({ appt }: { appt: ApptRow }) {
  const startAt = new Date(appt.startAt);
  const inJoinWindow =
    Date.now() >= startAt.getTime() - JOIN_WINDOW_MS &&
    Date.now() <= new Date(appt.endAt).getTime();
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 border border-[color:var(--rule-strong)] bg-paper-deep"
      />
      <div className="relative bg-paper border border-[color:var(--rule-strong)]">
        <div className="px-5 py-3.5 border-b border-[color:var(--rule)] flex items-center justify-between">
          <span className="eyebrow">Your next consultation</span>
          <span className="inline-flex items-center gap-1.5 eyebrow text-moss">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            {appt.status === "in_progress" ? "Live" : "Confirmed"}
          </span>
        </div>
        <div className="p-5 flex items-start gap-4 border-b border-[color:var(--rule)]">
          <div className="w-12 h-12 rounded-full bg-clay-wash text-clay font-display text-[18px] flex items-center justify-center">
            {appt.doctor.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[1.25rem] tracking-[-0.015em] leading-tight">
              Dr. {appt.doctor.name}
            </p>
            <p className="eyebrow mt-1">{relativeWhen(startAt)}</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 border-b border-[color:var(--rule)]">
          <div>
            <p className="eyebrow mb-1">Date</p>
            <p className="text-[14px] text-ink">{startAt.toLocaleString()}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Channel</p>
            <p className="text-[14px] text-ink">Encrypted video</p>
          </div>
        </div>
        <div className="p-5 flex items-center justify-between gap-3">
          <span className="mono text-[11px] text-ink-mute">
            APPT-{String(appt._id).slice(-8).toUpperCase()}
          </span>
          <div className="flex gap-2">
            <Link
              href="/dashboard/visits"
              className="btn btn-ghost px-3 py-1.5 text-[12px]"
            >
              Reschedule
            </Link>
            {inJoinWindow ? (
              <Link
                href={`/consult/${appt._id}`}
                className="btn btn-clay px-3 py-1.5 text-[12px]"
              >
                Join call →
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="btn btn-clay px-3 py-1.5 text-[12px] opacity-50 cursor-not-allowed"
              >
                Opens 15 min before
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
