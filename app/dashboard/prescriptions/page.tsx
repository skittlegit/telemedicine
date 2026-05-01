import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
  StatusPill,
} from "@/app/dashboard/_components/Shell";
import type { RxRow, OrderRow } from "@/app/dashboard/_lib/shared";

export const dynamic = "force-dynamic";

export default async function PatientPrescriptionsPage() {
  const session = await requireRole("patient");
  const userId = session.user.id;

  await connectDB();
  const [rx, orders] = await Promise.all([
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
  const active = rx.filter((r) => !r.fulfilledAt && !r.revokedAt);
  const past = rx.filter((r) => r.fulfilledAt || r.revokedAt);

  return (
    <>
      <PageHeader eyebrow="℞" title="Prescriptions">
        Active prescriptions and full history. View signed PDFs or send to a
        pharmacy.
      </PageHeader>

      <Section eyebrow="Active" title="Awaiting fulfilment">
        {active.length === 0 ? (
          <EmptyState message="No active prescriptions." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {active.map((r) => {
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

      <Section eyebrow="History" title="Fulfilled & expired">
        {past.length === 0 ? (
          <EmptyState message="No prescription history yet." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {past.map((r) => (
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
