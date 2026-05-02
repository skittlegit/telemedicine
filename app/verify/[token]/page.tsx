import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { User } from "@/lib/models/User";
import { verifyPrescription } from "@/lib/crypto";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify prescription · Vellum Health" };

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
      <main className="min-h-screen bg-paper text-ink">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
          <div className="masthead">
            <span>Prescription verification</span>
            <span className="meta text-oxblood">Not found</span>
          </div>
        </div>
        <section className="mx-auto w-full max-w-[760px] px-5 sm:px-6 lg:px-10 pt-16 pb-20">
          <p className="eyebrow text-oxblood">Not found</p>
          <h1 className="serif-display mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">
            No prescription.
          </h1>
          <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.7] max-w-[52ch]">
            This verification link is invalid, has expired, or has been
            revoked by the issuing clinician.
          </p>
          <Link href="/" className="btn-link mt-8 inline-flex">
            <span aria-hidden>←</span> Vellum Health
          </Link>
        </section>
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

  const verdict = rx.revokedAt
    ? { word: "Revoked", color: "text-oxblood", meta: "by issuing clinician" }
    : !valid
    ? { word: "Tampered", color: "text-oxblood", meta: "signature mismatch" }
    : { word: "Authentic", color: "text-moss", meta: "signature verified" };

  const status = rx.revokedAt ? "Revoked" : rx.fulfilledAt ? "Fulfilled" : "Active";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>Prescription verification</span>
          <span className="meta">HMAC-SHA256</span>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[820px] px-5 sm:px-6 lg:px-10 pt-12 pb-20">
        <Link href="/" className="btn-link">
          <span aria-hidden>←</span> Vellum Health
        </Link>

        <p className="eyebrow mt-8">Verdict</p>
        <h1 className={`serif-display mt-3 text-[clamp(2.75rem,7vw,5.5rem)] ${verdict.color}`}>
          {verdict.word}.
        </h1>
        <p className="mt-3 mono text-[12px] tracking-[0.14em] uppercase text-ink-mute">
          {verdict.meta}
        </p>

        <hr className="rule my-10 border-t border-[color:var(--rule-strong)]" />

        <dl className="grid grid-cols-12 gap-x-4 gap-y-4 text-[14.5px]">
          <dt className="col-span-4 sm:col-span-3 eyebrow pt-1">Patient</dt>
          <dd className="col-span-8 sm:col-span-9">{rx.patient.name}</dd>

          <dt className="col-span-4 sm:col-span-3 eyebrow pt-1">Issued by</dt>
          <dd className="col-span-8 sm:col-span-9">Dr. {rx.doctor.name}</dd>

          <dt className="col-span-4 sm:col-span-3 eyebrow pt-1">Issued on</dt>
          <dd className="col-span-8 sm:col-span-9 mono tabular text-[13px]">
            {new Date(rx.issuedAt).toISOString()}
          </dd>

          <dt className="col-span-4 sm:col-span-3 eyebrow pt-1">Reference</dt>
          <dd className="col-span-8 sm:col-span-9 mono text-[12px] break-all text-ink-mute">
            {String(rx._id)}
          </dd>

          <dt className="col-span-4 sm:col-span-3 eyebrow pt-1">Status</dt>
          <dd className="col-span-8 sm:col-span-9">{status}</dd>
        </dl>

        <hr className="rule my-10 border-t border-[color:var(--rule-strong)]" />

        <p className="eyebrow mb-5">Prescribed</p>
        <ol>
          {rx.drugs.map((d, i) => (
            <li
              key={i}
              className="grid grid-cols-12 gap-x-4 gap-y-1 py-4 border-t border-[color:var(--rule)] last:border-b last:border-[color:var(--rule)]"
            >
              <span className="col-span-2 sm:col-span-1 mono text-[12px] tabular text-ink-mute pt-1.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-10 sm:col-span-7">
                <p className="serif-section text-[1.1rem]">{d.name}</p>
                <p className="mono text-[11.5px] tracking-[0.14em] uppercase text-ink-mute mt-1">
                  {d.dose}
                </p>
              </div>
              <p className="col-span-12 sm:col-span-4 sm:text-right text-[13.5px] text-ink-soft sm:pt-2">
                {d.freq} · for {d.days} days
              </p>
            </li>
          ))}
        </ol>

        <hr className="rule my-10 border-t border-[color:var(--rule-strong)]" />

        <p className="eyebrow mb-3">Signature · HMAC-SHA256</p>
        <p className="mono text-[11.5px] break-all text-ink-mute leading-[1.6]">
          {rx.signature}
        </p>
      </section>
    </main>
  );
}
