import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";

export const metadata = { title: "On records · Vellum Health" };

const LAYERS: ReadonlyArray<{ k: string; v: string; body: string }> = [
  {
    k: "Encryption at rest",
    v: "AES-256-GCM",
    body:
      "Per-field encryption applied before any clinical document is written to the database. Keys are stored in environment-isolated KMS, not in the database itself, and rotate quarterly.",
  },
  {
    k: "Encryption in transit",
    v: "TLS 1.3",
    body:
      "All traffic between client, server, and partners uses TLS 1.3 with forward-secret ciphers. The site is HSTS-preload eligible and there are no long-lived session keys on the wire.",
  },
  {
    k: "Video signalling",
    v: "WebRTC · DTLS-SRTP",
    body:
      "Consult video is peer-to-peer where the network allows, with TURN-over-TLS fallback. Vellum servers do not record, store, or transit clinical media on the consult leg.",
  },
  {
    k: "Compliance posture",
    v: "HIPAA-aligned",
    body:
      "Architecture is BAA-ready end to end. Vendor inventory is short and audited: MongoDB Atlas, AWS S3, Stripe. Each carries a current BAA with us.",
  },
  {
    k: "Prescription integrity",
    v: "HMAC-SHA256",
    body:
      "Every prescription carries a per-record HMAC signature. Pharmacists verify the signature against our published verification ledger; forgery is computationally infeasible.",
  },
  {
    k: "Access trail",
    v: "Append-only audit log",
    body:
      "Every read or write of a clinical record is logged with actor, role, target, and reason. Patients may request the full ledger of accesses against their own file.",
  },
  {
    k: "Authentication",
    v: "Argon2-grade hashing",
    body:
      "Credentials are stored as bcrypt cost 12. Sessions are short-lived, HttpOnly, SameSite=Lax, and rotate on privilege change.",
  },
  {
    k: "Incident response",
    v: "Twenty-four-hour rota",
    body:
      "On-call rotation across security and platform engineers. Postmortems are published within seven days of any P1, in plain language, on the company status page.",
  },
];

const RIGHTS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Export your record",
    body:
      "Download every field, every visit, every prescription as a signed JSON bundle. The bundle is verifiable independently of Vellum.",
  },
  {
    title: "Erase your account",
    body:
      "One destructive request retires the file. We retain the minimum required by statute for six years and shred the rest, including derivatives in backups.",
  },
  {
    title: "Audit who looked",
    body:
      "See every staff member, clinician, or system process that has accessed your file, when, and on what stated reason.",
  },
];

export default async function SecurityPage() {
  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>On records</span>
          <span className="meta">A statement on how this is built</span>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-12 sm:pt-14 pb-14 grid grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-12 lg:col-span-9">
          <p className="eyebrow">Privacy and security</p>
          <h1 className="serif-display mt-5 text-[clamp(2.5rem,7.5vw,6rem)]">
            Read by you, and your doctor.{" "}
            <span className="italic-accent">Alone.</span>
          </h1>
          <p className="mt-7 max-w-[60ch] text-[16.5px] leading-[1.7] text-ink-soft">
            Notes, allergies, history, and addresses are encrypted at the
            field level before they touch our database. Prescriptions
            carry a per-record HMAC signature any pharmacist can verify
            independently of Vellum.
          </p>
        </div>
        <aside className="col-span-12 lg:col-span-3 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>Posture, in brief</strong>
            HIPAA-aligned operations · TLS 1.3 in transit · AES-256-GCM at
            rest · HMAC-SHA256 prescription signatures · immutable audit
            log of every access.
          </p>
        </aside>
      </section>

      {/* Defence in depth, long-form */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <div className="masthead mb-10">
            <span>By the layer</span>
            <span className="meta">Defence in depth · §02</span>
          </div>

          <ol>
            {LAYERS.map((layer, i) => (
              <li
                key={layer.k}
                className="grid grid-cols-12 gap-x-8 gap-y-3 border-t border-[color:var(--rule)] py-7 sm:py-9 last:border-b last:border-[color:var(--rule)]"
              >
                <div className="col-span-12 md:col-span-2">
                  <span className="numbered block text-[clamp(1.5rem,2.6vw,2rem)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <p className="serif-section text-[clamp(1.15rem,2vw,1.4rem)]">
                    {layer.k}
                  </p>
                  <p className="mono text-[12px] tracking-[0.14em] uppercase text-clay mt-2">
                    {layer.v}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <p className="text-[15px] leading-[1.7] text-ink-soft max-w-[58ch]">
                    {layer.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Patient rights */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="eyebrow">Your rights</p>
            <h2 className="serif-section mt-3 text-[clamp(1.85rem,4.5vw,2.85rem)] max-w-[16ch]">
              Export anything.{" "}
              <span className="italic-accent">Delete everything.</span>
            </h2>
            <p className="mt-5 max-w-[36ch] text-[14.5px] leading-[1.65] text-ink-soft">
              The record is yours. Vellum is the custodian, not the owner.
              Each of the rights below is exercised in plain English, by
              you, from your account.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <ul>
              {RIGHTS.map((r, i) => (
                <li
                  key={r.title}
                  className={
                    "grid grid-cols-12 gap-4 py-6 " +
                    (i === 0 ? "border-t border-b border-[color:var(--rule)]" : "border-b border-[color:var(--rule)]")
                  }
                >
                  <p className="col-span-12 sm:col-span-4 serif-section text-[clamp(1.05rem,2vw,1.3rem)]">
                    {r.title}
                  </p>
                  <p className="col-span-12 sm:col-span-8 text-[14.5px] leading-[1.7] text-ink-soft">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <h2 className="serif-display text-[clamp(2.25rem,7vw,5rem)] max-w-[20ch]">
            Privacy that is technical,{" "}
            <span className="italic-accent">not theatrical.</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn btn-clay btn-lg">
              Create your account <span aria-hidden>→</span>
            </Link>
            <Link href="/how-it-works" className="btn-link">
              How a visit runs <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
