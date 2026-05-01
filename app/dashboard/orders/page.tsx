import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
  StatusPill,
} from "@/app/dashboard/_components/Shell";
import type { OrderRow } from "@/app/dashboard/_lib/shared";

export const dynamic = "force-dynamic";

export default async function PatientOrdersPage() {
  const session = await requireRole("patient");
  const userId = session.user.id;

  await connectDB();
  const orders = await PharmacyOrder.find({ patient: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<OrderRow[]>();

  const open = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  );
  const closed = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status),
  );

  return (
    <>
      <PageHeader eyebrow="Pharmacy" title="Orders">
        Track prescriptions you&apos;ve sent to a pharmacy for fulfilment.
      </PageHeader>

      <Section
        eyebrow="In progress"
        title="Active orders"
        action={
          <Link href="/pharmacy" className="btn btn-ghost text-xs">
            Browse pharmacy →
          </Link>
        }
      >
        {open.length === 0 ? (
          <EmptyState
            message="No active orders."
            cta={
              <Link
                href="/dashboard/prescriptions"
                className="btn btn-clay text-xs"
              >
                See prescriptions →
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {open.map((o) => (
              <OrderRowItem key={o._id} order={o} />
            ))}
          </ul>
        )}
      </Section>

      <Section eyebrow="History" title="Past orders">
        {closed.length === 0 ? (
          <EmptyState message="No completed orders yet." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {closed.map((o) => (
              <OrderRowItem key={o._id} order={o} />
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function OrderRowItem({ order }: { order: OrderRow }) {
  return (
    <li className="px-4 py-3 flex flex-wrap justify-between items-center gap-3">
      <div>
        <p className="font-medium">
          Order {String(order._id).slice(-6).toUpperCase()}
        </p>
        <p className="mono text-[11px] text-ink-mute mt-0.5">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
      <StatusPill status={order.status} />
    </li>
  );
}
