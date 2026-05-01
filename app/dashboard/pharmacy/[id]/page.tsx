import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { Prescription } from "@/lib/models/Prescription";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { decryptPHI } from "@/lib/crypto";
import { audit } from "@/lib/audit";
import { advanceOrderAction } from "@/app/actions/pharmacy";
import {
  DashboardHeader,
  StatusPill,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface OrderView {
  _id: string;
  status: string;
  pharmacist?: string;
  patient: { _id: string; name: string };
  prescription: string;
  deliveryAddressEnc: string;
  totalCents: number;
  createdAt: Date;
  claimedAt?: Date;
  deliveredAt?: Date;
}

interface RxView {
  _id: string;
  doctor: { _id: string; name: string };
  drugs: Array<{ name: string; dose: string; freq: string; days: number; notes?: string }>;
  signature: string;
  verifyToken: string;
  issuedAt: Date;
}

const NEXT_STATUS: Record<string, Array<{ value: string; label: string }>> = {
  claimed: [
    { value: "preparing", label: "Mark as preparing" },
    { value: "cancelled", label: "Cancel order" },
  ],
  preparing: [
    { value: "out_for_delivery", label: "Out for delivery" },
    { value: "cancelled", label: "Cancel order" },
  ],
  out_for_delivery: [{ value: "delivered", label: "Mark delivered" }],
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PharmacyOrderDetailPage({ params }: PageProps) {
  const session = await requireRole("pharmacist");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  void User;

  const order = await PharmacyOrder.findById(id)
    .populate("patient", "name")
    .lean<OrderView | null>();
  if (!order) notFound();

  // Only the claiming pharmacist (or while still queued) sees details.
  if (order.pharmacist && String(order.pharmacist) !== session.user.id) {
    notFound();
  }

  const rx = await Prescription.findById(order.prescription)
    .populate("doctor", "name")
    .lean<RxView | null>();

  const address = order.pharmacist
    ? (() => {
        try {
          const decoded = JSON.parse(decryptPHI(order.deliveryAddressEnc) ?? "{}");
          void audit({
            actor: session.user.id,
            actorRole: "pharmacist",
            action: "pharmacy_order.read_address",
            target: `PharmacyOrder:${order._id}`,
          });
          return decoded;
        } catch {
          return null;
        }
      })()
    : null;

  const transitions = NEXT_STATUS[order.status] ?? [];

  return (
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader user={{ name: session.user.name ?? "Pharmacist", role: "pharmacist" }} />
      <div className="mx-auto w-full max-w-[820px] px-6 lg:px-8 py-10">
        <Link href="/dashboard/pharmacy" className="eyebrow text-ink-mute hover:text-clay">
          ← Queue
        </Link>
        <h1 className="font-display text-5xl tracking-tight mt-4">
          Order for {order.patient.name}
        </h1>
        <div className="mt-3"><StatusPill status={order.status} /></div>

        {rx && (
          <>
            <hr className="rule my-8" />
            <p className="eyebrow mb-3">Prescription · Dr. {rx.doctor.name}</p>
            <ol className="space-y-2">
              {rx.drugs.map((d, i) => (
                <li key={i} className="border border-[color:var(--rule)] p-3">
                  <p className="font-medium">
                    {d.name} <span className="mono text-ink-mute">· {d.dose}</span>
                  </p>
                  <p className="text-sm text-ink-soft">
                    {d.freq} · for {d.days} days
                  </p>
                </li>
              ))}
            </ol>
            <p className="mono text-[10px] text-ink-mute mt-2 break-all">
              HMAC: {rx.signature}
            </p>
            <a
              href={`/api/prescriptions/${rx._id}/pdf`}
              target="_blank"
              className="btn btn-ghost text-xs mt-3"
            >
              View PDF →
            </a>
          </>
        )}

        {address && (
          <>
            <hr className="rule my-8" />
            <p className="eyebrow mb-3">Delivery address</p>
            <address className="not-italic text-sm">
              {address.line1}
              <br />
              {address.line2 && (<>{address.line2}<br /></>)}
              {address.city}, {address.region} {address.postalCode}
              <br />
              {address.country}
            </address>
          </>
        )}

        {transitions.length > 0 && (
          <>
            <hr className="rule my-8" />
            <div className="flex flex-wrap gap-3">
              {transitions.map((t) => (
                <form key={t.value} action={advanceOrderAction}>
                  <input type="hidden" name="orderId" value={order._id} />
                  <input type="hidden" name="next" value={t.value} />
                  <button type="submit" className="btn btn-clay">
                    {t.label}
                  </button>
                </form>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
