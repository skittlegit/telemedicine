import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";

export const metadata = { title: "Security — Vellum Health" };

export default function SecurityPage() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader />

      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 pt-16 lg:pt-24 pb-12">
        <p className="eyebrow mb-3">Privacy &amp; security</p>
        <h1 className="font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.96] tracking-[-0.035em] max-w-[22ch]">
          Your record is read by you{" "}
          <span className="italic-accent">and your doctor — alone.</span>
        </h1>
        <p className="mt-7 text-ink-soft text-[17px] leading-[1.65] max-w-[58ch]">
          Notes, allergies, history, and addresses are encrypted at the field
          level before they touch our database. Prescriptions carry a per-record
          HMAC signature any pharmacist can verify independently.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {["HIPAA-aligned", "SOC 2 controls", "TLS 1.3", "AES-256-GCM"].map(
            (b) => (
              <span
                key={b}
                className="px-3 py-1.5 border border-[color:var(--rule-strong)] eyebrow text-ink"
              >
                {b}
              </span>
            ),
          )}
        </div>
      </section>

      <hr className="rule mx-6 lg:mx-8" />

      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-16 lg:py-20">
        <p className="eyebrow mb-3">By the layer</p>
        <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] tracking-[-0.025em] leading-[1.02] max-w-[34ch] mb-12">
          Defence in depth, explained{" "}
          <span className="italic-accent">in one table.</span>
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {[
            ["Encryption at rest", "AES-256-GCM", "PHI fields encrypted before they hit the database. Keys live in env, not Mongo."],
            ["Encryption in transit", "TLS 1.3", "All client/server traffic; modern ciphers only, HSTS preload eligible."],
            ["Video signalling", "WebRTC · DTLS-SRTP", "Peer-to-peer media when possible; STUN/TURN fallback over TLS."],
            ["Compliance posture", "HIPAA-aligned", "BAA-ready architecture. Vendor controls: Mongo Atlas, AWS S3, Stripe."],
            ["Prescription integrity", "HMAC-SHA256", "Every Rx carries a verifiable signature; pharmacists check independently."],
            ["Access trail", "Immutable audit log", "Every read of a record is logged with actor, role, target, and reason."],
            ["Authentication", "Argon2-grade hashing", "bcrypt cost 12. Sessions are short-lived, HttpOnly, SameSite=Lax."],
            ["Incident response", "On-call rotation", "Customers paged for any P1; postmortems published within 7 days."],
          ].map(([k, v, body]) => (
            <div key={k} className="bg-paper p-6">
              <dt className="eyebrow mb-1.5">{k}</dt>
              <dd>
                <p className="mono text-[13.5px] text-clay">{v}</p>
                <p className="text-ink-soft text-[13.5px] leading-[1.6] mt-2">
                  {body}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <hr className="rule mx-6 lg:mx-8" />

      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-16 lg:py-20 grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-3">Your rights</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] tracking-[-0.025em] leading-[1.02]">
            Export anything.{" "}
            <span className="italic-accent">Delete everything.</span>
          </h2>
        </div>
        <ul className="col-span-12 lg:col-span-7 divide-y divide-[color:var(--rule-strong)] border-y border-[color:var(--rule-strong)]">
          {[
            [
              "Export your record",
              "Download every field, every visit, every prescription as a signed JSON bundle. Anytime.",
            ],
            [
              "Erase your account",
              "One-click destructive delete. We retain the minimum required by law for 6 years and shred the rest.",
            ],
            [
              "Audit who looked",
              "See every staff member who has accessed your file, when, and why.",
            ],
          ].map(([title, body]) => (
            <li key={title} className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <p className="font-display text-[1.15rem] tracking-[-0.015em] leading-[1.2] md:col-span-1">
                {title}
              </p>
              <p className="text-ink-soft text-[14.5px] leading-[1.65] md:col-span-2">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 pb-24">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-10 lg:p-14 text-center">
          <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] tracking-[-0.03em] leading-[1] max-w-[22ch] mx-auto">
            Privacy that&apos;s{" "}
            <span className="italic-accent">technical, not theatrical.</span>
          </h2>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link href="/register" className="btn btn-clay" prefetch>
              Create your account <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
