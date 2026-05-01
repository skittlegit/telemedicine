import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { User } from "@/lib/models/User";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import { OrderForm, type PharmacyChoice } from "./OrderForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ prescriptionId: string }>;
}

interface RxView {
  _id: string;
  patient: string;
  doctor: { _id: string; name: string };
  fulfilledAt?: Date;
  revokedAt?: Date;
  drugs: Array<{ name: string; dose: string; days: number }>;
}

interface PharmacyRow {
  _id: string;
  user: { _id: string; name: string };
  pharmacyName: string;
  city: string;
  region: string;
}

export default async function PharmacyOrderPage({ params }: PageProps) {
  const session = await requireRole("patient");
  const { prescriptionId } = await params;
  if (!Types.ObjectId.isValid(prescriptionId)) notFound();

  await connectDB();
  void User;
  const [rx, pharmacies] = await Promise.all([
    Prescription.findById(prescriptionId)
      .populate("doctor", "name")
      .lean<RxView | null>(),
    PharmacyProfile.find({ licenseVerifiedAt: { $ne: null } })
      .populate("user", "name")
      .sort({ pharmacyName: 1 })
      .lean<PharmacyRow[]>(),
  ]);
  if (!rx) notFound();
  if (String(rx.patient) !== session.user.id) notFound();
  if (rx.revokedAt || rx.fulfilledAt) {
    return (
      <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
        <div className="text-center">
          <p className="eyebrow">Pharmacy</p>
          <h1 className="font-display text-4xl mt-2">Cannot order</h1>
          <p className="text-ink-soft mt-2">
            This prescription is {rx.revokedAt ? "revoked" : "already fulfilled"}.
          </p>
          <Link href="/dashboard" className="btn btn-ghost mt-6">← Dashboard</Link>
        </div>
      </main>
    );
  }

  const choices: PharmacyChoice[] = pharmacies
    .filter((p) => p.user)
    .map((p) => ({
      id: String(p.user._id),
      name: p.pharmacyName,
      city: p.city,
      region: p.region,
      eta: "2-3 days",
    }));

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[640px] px-5 sm:px-8 py-12">
        <Link href="/dashboard" className="eyebrow text-ink-mute hover:text-clay">
          ← Dashboard
        </Link>
        <h1 className="font-display text-3xl sm:text-5xl tracking-tight mt-4 break-words">Send to pharmacy</h1>
        <p className="text-ink-soft mt-2">
          Issued by Dr. {rx.doctor.name} · {rx.drugs.length} drug
          {rx.drugs.length === 1 ? "" : "s"}
        </p>

        <OrderForm prescriptionId={String(rx._id)} pharmacies={choices} />
      </div>
    </main>
  );
}
