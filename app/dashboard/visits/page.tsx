import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
  StatusPill,
} from "@/app/dashboard/_components/Shell";
import {
  ApptRowItem,
  type ApptRow,
  type RxRow,
  type OrderRow,
  JOIN_WINDOW_MS,
} from "@/app/dashboard/_lib/shared";

export const dynamic = "force-dynamic";

export default async function PatientVisitsPage() {
  const session = await requireRole("patient");
  const userId = session.user.id;
  const now = new Date();

  await connectDB();
  const [upcoming, past, rx, orders] = await Promise.all([
    Appointment.find({
      patient: userId,
      status: { $in: ["pending_payment", "scheduled", "in_progress"] },
      startAt: { $gte: new Date(now.getTime() - JOIN_WINDOW_MS) },
    })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: 1 })
      .lean<ApptRow[]>(),
    Appointment.find({
      patient: userId,
      status: { $in: ["completed", "cancelled", "no_show"] },
    })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: -1 })
      .limit(20)
      .lean<ApptRow[]>(),
    Prescription.find({ patient: userId })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ issuedAt: -1 })
      .limit(50)
      .lean<RxRow[]>(),
    PharmacyOrder.find({ patient: userId })
      .sort({ createdAt: -1 })
      .lean<OrderRow[]>(),
  ]);

  const ordersByRx = new Map(orders.map((o) => [String(o.prescription), o]));
  const activeRx = rx.filter((r) => !r.fulfilledAt && !r.revokedAt);
  const pastRx = rx.filter((r) => r.fulfilledAt || r.revokedAt);

  return (
    <>
      <PageHeader
        eyebrow="Records"
        title="Visits & prescriptions"
        italic="on file."
      >
        Upcoming consultations, every script we&apos;ve issued, and the orders
        attached to them — all in one place.
      </PageHeader>

      <Section
        eyebrow="Upcoming"
        title="Scheduled & in progress"
        action={
          <Link href="/doctors" className="btn btn-ghost text-xs">
            Book another →
          </Link>
        }
      >
        {upcoming.length === 0 ? (
          <EmptyState
            message="No upcoming visits."
            cta={
              <Link href="/doctors" className="btn btn-clay text-xs">
                Find a doctor →
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {upcoming.map((a) => (
              <ApptRowItem key={a._id} appt={a} as="patient" />
            ))}
          </ul>
        )}
      </Section>

      <Section eyebrow="℞ Active" title="Awaiting fulfilment">
        {activeRx.length === 0 ? (
          <EmptyState message="No active prescriptions." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {activeRx.map((r) => {
              const order = ordersByRx.get(String(r._id));
              return (
                <li
                  key={r._id}
                  className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {r.drugs.map((d) => d.name).join(", ")}
                    </p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5">
                      {new Date(r.issuedAt).toLocaleDateString()} · Dr.{" "}
                      {r.doctor.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/prescriptions/${r._id}/pdf`}
                      target="_blank"
                      className="btn btn-ghost text-xs"
                    >
                      View PDF
                    </a>
                    {order ? (
                      <StatusPill status={order.status} />
                    ) : (
                      <Link
                        href={`/pharmacy/order/${r._id}`}
                        className="btn btn-clay text-xs"
                      >
                        Order →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section eyebrow="History" title="Past visits">
        {past.length === 0 ? (
          <EmptyState message="No past visits yet." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {past.map((a) => (
              <ApptRowItem key={a._id} appt={a} as="patient" />
            ))}
          </ul>
        )}
      </Section>

      <Section eyebrow="℞ History" title="Fulfilled & expired prescriptions">
        {pastRx.length === 0 ? (
          <EmptyState message="No prescription history yet." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {pastRx.map((r) => (
              <li
                key={r._id}
                className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {r.drugs.map((d) => d.name).join(", ")}
                  </p>
                  <p className="mono text-[11px] text-ink-mute mt-0.5">
                    {new Date(r.issuedAt).toLocaleDateString()} · Dr.{" "}
                    {r.doctor.name} ·{" "}
                    {r.revokedAt ? "revoked" : "fulfilled"}
                  </p>
                </div>
                <a
                  href={`/api/prescriptions/${r._id}/pdf`}
                  target="_blank"
                  className="btn btn-ghost text-xs"
                >
                  View PDF
                </a>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
