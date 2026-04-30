import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { User } from "@/lib/models/User";
import { verifyPrescription } from "@/lib/crypto";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify prescription — Vellum Health" };

interface PageProps {
  params: Promise<{ token: string }>;
}

interface RxView {
  _id: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  drugs: Array<{ name: string; dose: string; freq: string; days: number }>;
  issuedAt: Date;
  signature: string;
  revokedAt?: Date;
  fulfilledAt?: Date;
}

export default async function VerifyPage({ params }: PageProps) {
  const { token } = await params;
  await connectDB();
  void User;

  const rx = await Prescription.findOne({ verifyToken: token })
    .populate("doctor", "name")
    .populate("patient", "name")
    .lean<RxView | null>();

  if (!rx) {
    return (
      <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="eyebrow text-oxblood">Not found</p>
          <h1 className="font-display text-5xl tracking-tight mt-3">No prescription</h1>
          <p className="text-ink-soft mt-4">
            This verification link is invalid or has been revoked.
          </p>
          <Link href="/" className="btn btn-ghost mt-8">← Vellum Health</Link>
        </div>
      </main>
    );
  }

  const valid = verifyPrescription(
    {
      id: String(rx._id),
      doctorId: String(rx.doctor._id),
      patientId: String(rx.patient._id),
      issuedAt: new Date(rx.issuedAt).getTime(),
      drugs: rx.drugs,
    },
    rx.signature,
  );

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[640px] px-8 py-16">
        <Link href="/" className="eyebrow text-ink-mute hover:text-clay">
          ← Vellum Health
        </Link>

        <p className="eyebrow mt-6">Prescription verification</p>
        <h1 className="font-display text-5xl tracking-tight mt-2">
          {valid && !rx.revokedAt ? (
            <span className="text-moss">Authentic</span>
          ) : rx.revokedAt ? (
            <span className="text-oxblood">Revoked</span>
          ) : (
            <span className="text-oxblood">Tampered</span>
          )}
        </h1>

        <hr className="rule my-8" />

        <dl className="grid grid-cols-[160px_1fr] gap-y-3 text-sm">
          <dt className="eyebrow">Patient</dt>
          <dd>{rx.patient.name}</dd>

          <dt className="eyebrow">Issued by</dt>
          <dd>Dr. {rx.doctor.name}</dd>

          <dt className="eyebrow">Issued on</dt>
          <dd className="mono">{new Date(rx.issuedAt).toISOString()}</dd>

          <dt className="eyebrow">Reference</dt>
          <dd className="mono text-xs break-all">{String(rx._id)}</dd>

          <dt className="eyebrow">Status</dt>
          <dd>
            {rx.revokedAt
              ? "Revoked"
              : rx.fulfilledAt
              ? "Fulfilled"
              : "Active"}
          </dd>
        </dl>

        <hr className="rule my-8" />

        <p className="eyebrow mb-3">Prescribed</p>
        <ol className="space-y-3">
          {rx.drugs.map((d, i) => (
            <li key={i} className="border border-[color:var(--rule)] p-3">
              <p className="font-medium">{d.name} <span className="mono text-ink-mute">· {d.dose}</span></p>
              <p className="text-sm text-ink-soft">{d.freq} · for {d.days} days</p>
            </li>
          ))}
        </ol>

        <hr className="rule my-8" />
        <p className="eyebrow text-xs">
          Signature (HMAC-SHA256): <span className="mono break-all">{rx.signature}</span>
        </p>
      </div>
    </main>
  );
}
