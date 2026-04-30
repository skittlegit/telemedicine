import Link from "next/link";
import { connectDB } from "@/lib/db";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { claimOrderAction } from "@/app/actions/pharmacy";

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

export default async function PharmacyDashboard() {
  const session = await requireRole("pharmacist");
  await connectDB();
  void User;

  const [queue, mine] = await Promise.all([
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
  ]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1100px] px-8 py-10">
        <p className="eyebrow">Pharmacy queue</p>
        <h1 className="font-display text-5xl tracking-tight mt-2">Dispensary</h1>
        <p className="text-ink-soft mt-2">Welcome, {session.user.name}.</p>

        <hr className="rule my-8" />
        <h2 className="font-display text-3xl mb-4">In progress</h2>
        {mine.length === 0 ? (
          <p className="text-ink-mute italic text-sm">No active orders.</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((o) => (
              <li
                key={o._id}
                className="border border-[color:var(--rule)] p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{o.patient.name}</p>
                  <p className="eyebrow">{o.status}</p>
                </div>
                <Link href={`/dashboard/pharmacy/${o._id}`} className="btn btn-ghost text-xs">
                  Open →
                </Link>
              </li>
            ))}
          </ul>
        )}

        <hr className="rule my-10" />
        <h2 className="font-display text-3xl mb-4">Open queue</h2>
        {queue.length === 0 ? (
          <p className="text-ink-mute italic text-sm">No orders waiting.</p>
        ) : (
          <ul className="space-y-2">
            {queue.map((o) => (
              <li
                key={o._id}
                className="border border-[color:var(--rule)] p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{o.patient.name}</p>
                  <p className="mono text-xs text-ink-mute">
                    Queued {new Date(o.createdAt).toLocaleString()}
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
      </div>
    </main>
  );
}
