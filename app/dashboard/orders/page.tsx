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
import { OrderTimeline } from "@/app/dashboard/_components/OrderTimeline";

export const dynamic = "force-dynamic";

interface OrderListRow {
  _id: string;
  kind?: "rx" | "marketplace";
  status: string;
  createdAt: Date;
  claimedAt?: Date;
  prescription?: string;
  totalCents?: number;
  items?: Array<{ name: string; strength?: string; qty: number }>;
}

export default async function PatientOrdersPage() {
  const session = await requireRole("patient");
  const userId = session.user.id;

  await connectDB();
  const orders = await PharmacyOrder.find({ patient: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<OrderListRow[]>();

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
          <Link href="/dashboard/visits" className="btn btn-ghost text-xs">
            Your prescriptions →
          </Link>
        }
      >
        {open.length === 0 ? (
          <EmptyState
            message="No active orders."
            cta={
              <Link
                href="/dashboard/visits"
                className="btn btn-clay text-xs"
              >
                See prescriptions →
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {open.map((o) => (
              <li
                key={o._id}
                className="border border-[color:var(--rule)] bg-paper p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="font-medium text-[14px]">
                      {o.kind === "marketplace" ? "Marketplace order" : "Order"}{" "}
                      {String(o._id).slice(-6).toUpperCase()}
                    </p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5">
                      Placed {new Date(o.createdAt).toLocaleString()}
                      {o.items && o.items.length > 0 && (
                        <>
                          {" · "}
                          {o.items.length} item{o.items.length === 1 ? "" : "s"}
                        </>
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/orders/${o._id}`}
                    className="eyebrow text-clay hover:underline"
                  >
                    Details →
                  </Link>
                </div>
                {o.items && o.items.length > 0 && (
                  <ul className="mb-4 text-[13px] text-ink-soft">
                    {o.items.slice(0, 4).map((it, idx) => (
                      <li key={idx} className="flex justify-between py-0.5">
                        <span>
                          {it.name} {it.strength ?? ""}
                        </span>
                        <span className="mono tabular text-ink-mute">× {it.qty}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <OrderTimeline
                  status={o.status}
                  claimedAt={o.claimedAt ? o.claimedAt.toISOString() : null}
                  createdAt={o.createdAt.toISOString()}
                />
              </li>
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
              <li
                key={o._id}
                className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
              >
                <div>
                  <Link
                    href={`/dashboard/orders/${o._id}`}
                    className="font-medium hover:text-clay"
                  >
                    Order {String(o._id).slice(-6).toUpperCase()}
                  </Link>
                  <p className="mono text-[11px] text-ink-mute mt-0.5">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
