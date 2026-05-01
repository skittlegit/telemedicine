import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { formatINR2 } from "@/lib/money";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { Prescription } from "@/lib/models/Prescription";
import { User } from "@/lib/models/User";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import { decryptPHI } from "@/lib/crypto";
import {
  PageHeader,
  Section,
  StatusPill,
} from "@/app/dashboard/_components/Shell";
import { OrderTimeline } from "@/app/dashboard/_components/OrderTimeline";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface OrderView {
  _id: string;
  patient: string;
  pharmacy?: string;
  status: string;
  totalCents: number;
  createdAt: Date;
  claimedAt?: Date;
  deliveredAt?: Date;
  deliveryAddressEnc: string;
  prescription: {
    _id: string;
    drugs: Array<{ name: string; dose: string; days: number }>;
    doctor?: { name: string };
  };
}

interface AddressView {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export default async function PatientOrderDetailPage({ params }: PageProps) {
  const session = await requireRole("patient");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  void User;
  const order = await PharmacyOrder.findById(id)
    .populate({
      path: "prescription",
      select: "drugs doctor",
      populate: { path: "doctor", select: "name" },
    })
    .lean<OrderView | null>();

  if (!order) notFound();
  if (String(order.patient) !== session.user.id) notFound();

  const pharmacy = order.pharmacy
    ? await PharmacyProfile.findOne({ user: order.pharmacy })
        .populate("user", "name")
        .lean<{
          pharmacyName: string;
          city: string;
          region: string;
          phone?: string;
        } | null>()
    : null;

  let address: AddressView = {};
  try {
    const decrypted = decryptPHI(order.deliveryAddressEnc);
    if (decrypted) address = JSON.parse(decrypted) as AddressView;
  } catch {
    address = {};
  }

  void Prescription;

  return (
    <>
      <PageHeader
        eyebrow="Pharmacy"
        title={`Order ${String(order._id).slice(-6).toUpperCase()}`}
      >
        Placed {new Date(order.createdAt).toLocaleString()}
      </PageHeader>

      <Section eyebrow="Status" title="Where your order is">
        <div className="border border-[color:var(--rule)] bg-paper p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <StatusPill status={order.status} />
            <span className="mono text-[11px] text-ink-mute">
              {formatINR2(order.totalCents)} fulfilment fee
            </span>
          </div>
          <OrderTimeline
            status={order.status}
            claimedAt={order.claimedAt ? order.claimedAt.toISOString() : null}
            createdAt={order.createdAt.toISOString()}
          />
        </div>
      </Section>

      <Section eyebrow="Details" title="Pharmacy & delivery">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          <div className="bg-paper p-5">
            <p className="eyebrow mb-2">Filling at</p>
            {pharmacy ? (
              <>
                <p className="text-[15px] font-semibold tracking-[-0.012em]">
                  {pharmacy.pharmacyName}
                </p>
                <p className="text-[13px] text-ink-soft mt-1">
                  {pharmacy.city}, {pharmacy.region}
                </p>
                {pharmacy.phone && (
                  <p className="mono text-[12px] text-ink-mute mt-1">
                    {pharmacy.phone}
                  </p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-ink-mute">In queue.</p>
            )}
          </div>
          <div className="bg-paper p-5">
            <p className="eyebrow mb-2">Deliver to</p>
            <p className="text-[14px] text-ink-soft leading-[1.5]">
              {address.line1 ?? "—"}
              {address.line2 ? <><br />{address.line2}</> : null}
              <br />
              {[address.city, address.region, address.postalCode]
                .filter(Boolean)
                .join(", ")}
              {address.country ? <><br />{address.country}</> : null}
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Prescription" title="What's being filled">
        <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
          {order.prescription.drugs.map((d, i) => (
            <li
              key={`${d.name}-${i}`}
              className="px-4 py-3 flex justify-between items-center text-[14px]"
            >
              <span className="font-medium">{d.name}</span>
              <span className="text-ink-mute mono text-[12px]">
                {d.dose} · {d.days}d
              </span>
            </li>
          ))}
        </ul>
        {order.prescription.doctor?.name && (
          <p className="mt-3 text-[12.5px] text-ink-mute">
            Issued by Dr. {order.prescription.doctor.name}
          </p>
        )}
      </Section>

      <div className="mt-8">
        <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">
          ← All orders
        </Link>
      </div>
    </>
  );
}
