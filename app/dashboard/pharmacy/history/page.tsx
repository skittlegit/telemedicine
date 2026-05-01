import { connectDB } from "@/lib/db";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
  StatusPill,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface HistoryRow {
  _id: string;
  status: string;
  patient: { _id: string; name: string };
  createdAt: Date;
  claimedAt?: Date;
  deliveredAt?: Date;
}

export default async function PharmacyHistoryPage() {
  const session = await requireRole("pharmacist");

  await connectDB();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [today, past] = await Promise.all([
    PharmacyOrder.find({
      pharmacist: session.user.id,
      status: "delivered",
      deliveredAt: { $gte: startOfToday },
    })
      .populate("patient", "name")
      .sort({ deliveredAt: -1 })
      .lean<HistoryRow[]>(),
    PharmacyOrder.find({
      pharmacist: session.user.id,
      status: { $in: ["delivered", "cancelled"] },
      deliveredAt: { $lt: startOfToday },
    })
      .populate("patient", "name")
      .sort({ deliveredAt: -1, createdAt: -1 })
      .limit(50)
      .lean<HistoryRow[]>(),
  ]);

  return (
    <>
      <PageHeader eyebrow="History" title="Past orders">
        Delivered today and your last 50 closed orders.
      </PageHeader>

      <Section eyebrow="Today" title={`${today.length} delivered`}>
        {today.length === 0 ? (
          <EmptyState message="Nothing delivered yet today." />
        ) : (
          <HistoryList rows={today} />
        )}
      </Section>

      <Section eyebrow="Earlier" title="Recent history">
        {past.length === 0 ? (
          <EmptyState message="No earlier history." />
        ) : (
          <HistoryList rows={past} />
        )}
      </Section>
    </>
  );
}

function HistoryList({ rows }: { rows: HistoryRow[] }) {
  return (
    <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
      {rows.map((o) => (
        <li
          key={o._id}
          className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
        >
          <div>
            <p className="font-medium">{o.patient.name}</p>
            <p className="mono text-[11px] text-ink-mute mt-0.5">
              Order {String(o._id).slice(-6).toUpperCase()} ·{" "}
              {o.deliveredAt
                ? `${o.status === "cancelled" ? "Cancelled" : "Delivered"} ${new Date(o.deliveredAt).toLocaleString()}`
                : `Created ${new Date(o.createdAt).toLocaleString()}`}
            </p>
          </div>
          <StatusPill status={o.status} />
        </li>
      ))}
    </ul>
  );
}
