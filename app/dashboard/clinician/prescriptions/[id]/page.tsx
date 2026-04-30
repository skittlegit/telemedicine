import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { User } from "@/lib/models/User";
import { requireSession } from "@/lib/authz";
import { decryptPHI } from "@/lib/crypto";
import { prescriptionQrDataUrl } from "@/app/actions/prescription";
import { env } from "@/lib/env";
import { DashboardHeader } from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface RxView {
  _id: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  drugs: Array<{ name: string; dose: string; freq: string; days: number; notes?: string }>;
  diagnosisEnc?: string;
  issuedAt: Date;
  signature: string;
  verifyToken: string;
  fulfilledAt?: Date;
  revokedAt?: Date;
}

export default async function PrescriptionPage({ params }: PageProps) {
  const session = await requireSession();
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  void User;
  const rx = await Prescription.findById(id)
    .populate("doctor", "name")
    .populate("patient", "name")
    .lean<RxView | null>();
  if (!rx) notFound();

  const me = session.user.id;
  const role = session.user.role;
  if (
    String(rx.doctor._id) !== me &&
    String(rx.patient._id) !== me &&
    role !== "pharmacist" &&
    role !== "admin"
  ) {
    notFound();
  }

  const qr = await prescriptionQrDataUrl(rx.verifyToken);
  const diagnosis = decryptPHI(rx.diagnosisEnc) ?? "";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader user={{ name: session.user.name ?? "User", role }} />
      <div className="mx-auto w-full max-w-[720px] px-6 lg:px-8 py-12">
        <Link href="/dashboard" className="eyebrow text-ink-mute hover:text-clay">
          ← Dashboard
        </Link>

        <p className="eyebrow mt-6">℞ Prescription</p>
        <h1 className="font-display text-5xl tracking-tight mt-2">
          {rx.patient.name}
        </h1>
        <p className="mono text-xs text-ink-mute mt-1">{String(rx._id)}</p>

        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <p className="eyebrow">Issued by</p>
            <p>Dr. {rx.doctor.name}</p>
            <p className="eyebrow mt-4">Issued on</p>
            <p className="mono text-sm">{new Date(rx.issuedAt).toISOString()}</p>
            <p className="eyebrow mt-4">Status</p>
            <p>
              {rx.revokedAt
                ? "Revoked"
                : rx.fulfilledAt
                ? "Fulfilled"
                : "Active"}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Image src={qr} alt="Verification QR" width={140} height={140} unoptimized />
            <a
              href={`${env.APP_URL}/verify/${rx.verifyToken}`}
              className="mono text-[10px] text-ink-mute mt-2 break-all"
            >
              {`/verify/${rx.verifyToken}`}
            </a>
          </div>
        </div>

        {diagnosis && (
          <div className="mt-8 border border-[color:var(--rule)] p-3">
            <p className="eyebrow mb-1">Diagnosis</p>
            <p className="text-sm text-ink-soft">{diagnosis}</p>
          </div>
        )}

        <hr className="rule my-8" />
        <p className="eyebrow mb-3">Drugs</p>
        <ol className="space-y-3">
          {rx.drugs.map((d, i) => (
            <li key={i} className="border border-[color:var(--rule)] p-3">
              <p className="font-medium">
                {d.name} <span className="mono text-ink-mute">· {d.dose}</span>
              </p>
              <p className="text-sm text-ink-soft">
                {d.freq} · for {d.days} days
                {d.notes ? ` · ${d.notes}` : ""}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href={`/api/prescriptions/${rx._id}/pdf`} target="_blank" className="btn btn-clay">
            Download PDF →
          </a>
          {role === "patient" && !rx.fulfilledAt && !rx.revokedAt && (
            <Link href={`/pharmacy/order/${rx._id}`} className="btn btn-ghost">
              Send to pharmacy →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
