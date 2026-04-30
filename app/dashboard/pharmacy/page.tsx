import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { claimOrderAction } from "@/app/actions/pharmacy";
import {
  DashboardHeader,
  PageHeader,
  StatGrid,
  StatTile,
  Section,
  EmptyState,
  StatusPill,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface QueueRow {
  _id: string;
  patient: { _id: string; name: string };
  totalCents: number;
  createdAt: Date;
}
interface MyRow extends QueueRow {
  status: string;
}
interface DeliveredRow extends MyRow {
  deliveredAt?: Date;
  claimedAt?: Date;
}

export default async function PharmacyDashboard() {
  const session = await requireRole("pharmacist");
  await connectDB();
  void User;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [profile, queue, mine, deliveredToday, fulfilled7d] = await Promise.all([
    PharmacyProfile.findOne({ user: session.user.id })
      .lean<{ pharmacyName: string; licenseVerifiedAt?: Date } | null>(),
    PharmacyOrder.find({ status: "queued" })
      .populate("patient", "name")
      .sort({ createdAt: 1 })
      .limit(50)
      .lean<QueueRow[]>(),
    PharmacyOrder.find({
      pharmacist: session.user.id,
      status: { $in: ["claimed", "preparing", "out_for_delivery"] },
    })
      .populate("patient", "name")
      .sort({ createdAt: -1 })
      .lean<MyRow[]>(),
    PharmacyOrder.find({
      pharmacist: session.user.id,
      status: "delivered",
      deliveredAt: { $gte: startOfToday },
    })
      .populate("patient", "name")
      .sort({ deliveredAt: -1 })
      .limit(20)
      .lean<DeliveredRow[]>(),
    PharmacyOrder.find({
      pharmacist: session.user.id,
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
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader user={{ name: session.user.name ?? "Pharmacist", role: "pharmacist" }} />
      <PageHeader
        eyebrow="Dispensary"
        title={profile?.pharmacyName ?? "Pharmacy"}
        italic="queue."
      >
        Welcome, {session.user.name}. {queue.length} orders waiting · {mine.length} in your hands.
      </PageHeader>

      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pb-24">
        {profile && (
          <div
            className={`mb-10 border p-4 flex flex-wrap items-center justify-between gap-3 ${
              verified ? "border-moss/40 bg-moss/5" : "border-amber/40 bg-amber/10"
            }`}
          >
            <div>
              <p className="eyebrow mb-1">Licensure</p>
              <p className={`text-sm ${verified ? "text-moss" : "text-amber"}`}>
                {verified
                  ? `Verified by Vellum on ${new Date(profile.licenseVerifiedAt!).toLocaleDateString()}`
                  : "Pending admin verification."}
              </p>
            </div>
            <Link href="/dashboard/pharmacy/profile" className="btn btn-ghost text-xs">
              Manage profile →
            </Link>
          </div>
        )}

        <StatGrid cols={4}>
          <StatTile label="Open queue" value={queue.length} />
          <StatTile label="In progress" value={mine.length} hint="Claimed by you" />
          <StatTile label="Delivered today" value={deliveredToday.length} />
          <StatTile label="Avg fulfilment" value={avgHrs === "—" ? "—" : `${avgHrs}h`} hint="Claim → delivered, last 7 days" />
        </StatGrid>

        <Section id="mine" eyebrow="In progress" title="Your orders">
          {mine.length === 0 ? (
            <EmptyState message="No active orders. Claim one from the queue." />
          ) : (
            <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
              {mine.map((o) => (
                <li
                  key={o._id}
                  className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
                >
                  <div>
                    <p className="font-medium">{o.patient.name}</p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5">
                      Order {String(o._id).slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={o.status} />
                    <Link href={`/dashboard/pharmacy/${o._id}`} className="btn btn-clay text-xs">
                      Open →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section eyebrow="Queue" title="Open orders">
          {queue.length === 0 ? (
            <EmptyState message="No orders waiting — clear queue." />
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
                      Queued {new Date(o.createdAt).toLocaleString()} · ${(o.totalCents / 100).toFixed(2)}
                    </p>
                  </div>
                  <form action={claimOrderAction}>
                    <input type="hidden" name="orderId" value={o._id} />
                    <button type="submit" className="btn btn-clay text-xs">
                      Claim →
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section eyebrow="Today" title="Delivered">
          {deliveredToday.length === 0 ? (
            <EmptyState message="Nothing delivered yet today." />
          ) : (
            <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
              {deliveredToday.map((o) => (
                <li
                  key={o._id}
                  className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
                >
                  <div>
                    <p className="font-medium">{o.patient.name}</p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5">
                      Delivered {o.deliveredAt ? new Date(o.deliveredAt).toLocaleTimeString() : "—"}
                    </p>
                  </div>
                  <StatusPill status="delivered" />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </main>
  );
}
