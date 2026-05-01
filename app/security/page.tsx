import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";

export const metadata = { title: "Security — Vellum Health" };

export default async function SecurityPage() {
  const headerProps = await marketingHeaderProps();
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10">
        <p className="eyebrow mb-2.5">Privacy &amp; security</p>
        <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] max-w-[22ch]">
          Your record is read by you, and your doctor. Alone.
        </h1>
        <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[58ch]">
          Notes, allergies, history, and addresses are encrypted at the field
          level before they touch our database. Prescriptions carry a per-record
          HMAC signature any pharmacist can verify independently.
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {["HIPAA-aligned", "SOC 2 controls", "TLS 1.3", "AES-256-GCM"].map(
            (b) => (
              <span
                key={b}
                className="px-2.5 py-1 border border-[color:var(--rule-strong)] eyebrow text-ink rounded-sm"
              >
                {b}
              </span>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14">
        <p className="eyebrow mb-2.5">By the layer</p>
        <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2] max-w-[34ch] mb-8">
          Defence in depth, explained in one table.
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
            <div key={k} className="bg-paper p-5">
              <dt className="eyebrow mb-1.5">{k}</dt>
              <dd>
                <p className="mono text-[13px] text-clay">{v}</p>
                <p className="text-ink-soft text-[13px] leading-[1.6] mt-1.5">
                  {body}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-12 gap-x-10 gap-y-8">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-2.5">Your rights</p>
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
            Export anything. Delete everything.
          </h2>
        </div>
        <ul className="col-span-12 lg:col-span-7 divide-y divide-[color:var(--rule)] border-y border-[color:var(--rule-strong)]">
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
            <li key={title} className="py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <p className="text-[14.5px] font-semibold tracking-[-0.01em] leading-[1.35] md:col-span-1">
                {title}
              </p>
              <p className="text-ink-soft text-[13.5px] leading-[1.65] md:col-span-2">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-20">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-8 sm:p-12 text-center rounded-sm">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.022em] leading-[1.2] max-w-[24ch] mx-auto">
            Privacy that&apos;s technical, not theatrical.
          </h2>
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            <Link href="/register" className="btn btn-clay" prefetch>
              Create your account <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
