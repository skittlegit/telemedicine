import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import { claimOrderAction } from "@/app/actions/pharmacy";
import {
  PageHeader,
  StatGrid,
  StatTile,
  Section,
  EmptyState,
  LicenseBanner,
} from "@/app/dashboard/_components/Shell";
import { formatINR2 } from "@/lib/money";

export const dynamic = "force-dynamic";

interface QueueRow {
  _id: string;
  patient: { _id: string; name: string };
  totalCents: number;
  createdAt: Date;
}

export default async function PharmacyQueuePage() {
  const session = await requireRole("pharmacist");
  await connectDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [profile, queue, mineCount, deliveredTodayCount, fulfilled7d] =
    await Promise.all([
      PharmacyProfile.findOne({ user: session.user.id }).lean<{
        pharmacyName: string;
        licenseVerifiedAt?: Date;
      } | null>(),
      PharmacyOrder.find({
        pharmacy: session.user.id,
        status: "queued",
        paidAt: { $ne: null },
      })
        .populate("patient", "name")
        .sort({ createdAt: 1 })
        .limit(50)
        .lean<QueueRow[]>(),
      PharmacyOrder.countDocuments({
        pharmacy: session.user.id,
        status: { $in: ["claimed", "preparing", "out_for_delivery"] },
      }),
      PharmacyOrder.countDocuments({
        pharmacy: session.user.id,
        status: "delivered",
        deliveredAt: { $gte: startOfToday },
      }),
      PharmacyOrder.find({
        pharmacy: session.user.id,
        status: "delivered",
        deliveredAt: { $gte: last7d },
      })
        .select("claimedAt deliveredAt")
        .lean<{ claimedAt?: Date; deliveredAt?: Date }[]>(),
    ]);

  const fulfilTimes = fulfilled7d
    .filter((o) => o.claimedAt && o.deliveredAt)
    .map((o) => o.deliveredAt!.getTime() - o.claimedAt!.getTime());
  const avgMs = fulfilTimes.length
    ? fulfilTimes.reduce((a, b) => a + b, 0) / fulfilTimes.length
    : 0;
  const avgHrs = avgMs ? (avgMs / (60 * 60 * 1000)).toFixed(1) : "—";

  const verified = !!profile?.licenseVerifiedAt;

  return (
    <>
      <PageHeader
        eyebrow="Dispensary"
        title={profile?.pharmacyName ?? "Pharmacy"}
        italic="queue."
      >
        {queue.length} orders waiting · {mineCount} in your hands.
      </PageHeader>

      {profile && (
        <LicenseBanner
          verified={verified}
          verifiedAt={profile.licenseVerifiedAt}
          manageHref="/dashboard/pharmacy/profile"
        />
      )}

      <StatGrid cols={4}>
        <StatTile label="Open queue" value={queue.length} />
        <StatTile
          label="In progress"
          value={mineCount}
          hint="Claimed by you"
        />
        <StatTile label="Delivered today" value={deliveredTodayCount} />
        <StatTile
          label="Avg fulfilment"
          value={avgHrs === "—" ? "—" : `${avgHrs}h`}
          hint="Claim → delivered, last 7 days"
        />
      </StatGrid>

      <Section
        eyebrow="Just in"
        title="New orders"
        action={
          <Link
            href="/dashboard/pharmacy/active"
            className="btn btn-ghost text-xs"
          >
            See active →
          </Link>
        }
      >
        {queue.length === 0 ? (
          <EmptyState message="No new orders — all caught up." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {queue.map((o) => (
              <li
                key={o._id}
                className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
              >
                <div>
                  <p className="font-medium">{o.patient.name}</p>
                  <p className="mono text-[11px] text-ink-mute mt-0.5">
                    Received {new Date(o.createdAt).toLocaleString()} ·{" "}
                    {formatINR2(o.totalCents)}
                  </p>
                </div>
                <form action={claimOrderAction}>
                  <input type="hidden" name="orderId" value={o._id} />
                  <button type="submit" className="btn btn-clay text-xs">
                    Claim order →
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
