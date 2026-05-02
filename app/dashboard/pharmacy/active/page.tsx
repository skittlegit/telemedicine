import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { requireRole } from "@/lib/authz";
import { advanceOrderAction } from "@/app/actions/pharmacy";
import {
  PageHeader,
  Section,
  EmptyState,
  StatusPill,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface MyRow {
  _id: string;
  status: string;
  patient: { _id: string; name: string };
  createdAt: Date;
  claimedAt?: Date;
}

export default async function PharmacyActivePage() {
  const session = await requireRole("pharmacist");

  await connectDB();
  const mine = await PharmacyOrder.find({
    pharmacist: session.user.id,
    status: { $in: ["claimed", "preparing", "out_for_delivery"] },
  })
    .populate("patient", "name")
    .sort({ claimedAt: -1, createdAt: -1 })
    .lean<MyRow[]>();

  const grouped = {
    claimed: mine.filter((o) => o.status === "claimed"),
    preparing: mine.filter((o) => o.status === "preparing"),
    out_for_delivery: mine.filter((o) => o.status === "out_for_delivery"),
  };

  return (
    <>
      <PageHeader eyebrow="In progress" title="Your active orders">
        Orders you&apos;ve claimed, grouped by stage.
      </PageHeader>

      {mine.length === 0 ? (
        <Section eyebrow="Empty" title="Nothing in progress">
          <EmptyState
            message="You haven't claimed any orders yet."
            cta={
              <Link href="/dashboard/pharmacy" className="btn btn-clay text-xs">
                Open queue →
              </Link>
            }
          />
        </Section>
      ) : (
        <>
          <Stage label="Claimed" rows={grouped.claimed} />
          <Stage label="Preparing" rows={grouped.preparing} />
          <Stage label="Out for delivery" rows={grouped.out_for_delivery} />
        </>
      )}
    </>
  );
}

function Stage({ label, rows }: { label: string; rows: MyRow[] }) {
  if (rows.length === 0) return null;
  return (
    <Section eyebrow={label} title={`${rows.length} order${rows.length === 1 ? "" : "s"}`}>
      <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
        {rows.map((o) => (
          <li
            key={o._id}
            className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
          >
            <div>
              <p className="font-medium">{o.patient.name}</p>
              <p className="mono text-[11px] text-ink-mute mt-0.5">
                Order {String(o._id).slice(-6).toUpperCase()} · claimed{" "}
                {o.claimedAt
                  ? new Date(o.claimedAt).toLocaleString()
                  : new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={o.status} />
              <NextStatusForm id={o._id} status={o.status} />
              <Link
                href={`/dashboard/pharmacy/${o._id}`}
                className="btn btn-clay text-xs"
              >
                Open →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function NextStatusForm({ id, status }: { id: string; status: string }) {
  const next =
    status === "claimed"
      ? "preparing"
      : status === "preparing"
        ? "out_for_delivery"
        : status === "out_for_delivery"
          ? "delivered"
          : null;
  if (!next) return null;
  const label =
    next === "preparing"
      ? "Mark preparing"
      : next === "out_for_delivery"
        ? "Out for delivery"
        : "Mark delivered";
  return (
    <form action={advanceOrderAction}>
      <input type="hidden" name="orderId" value={id} />
      <input type="hidden" name="next" value={next} />
      <button type="submit" className="btn btn-ghost btn-sm">
        {label} →
      </button>
    </form>
  );
}
