import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";

export const metadata = {
  title: "Pharmacy · Vellum Health",
  description:
    "How a Vellum prescription is signed, verified, and dispensed by an independent partner pharmacy.",
};

const STAGES: ReadonlyArray<{
  n: string;
  head: string;
  italic: string;
  body: string;
  filed: string;
}> = [
  {
    n: "01",
    head: "Signed at the desk",
    italic: "by a named hand.",
    body:
      "Your clinician writes the prescription inside the consult room. On submission it is hashed with HMAC-SHA256 against the visit, the patient, and the issuing licence. Forgery is computationally infeasible; substitution is impossible without leaving a mark.",
    filed: "Filed under · §§01.A · Signature",
  },
  {
    n: "02",
    head: "Verified on claim",
    italic: "by an independent pharmacist.",
    body:
      "Partner pharmacies in the metro you ordered from receive the script in their queue. Each pharmacist verifies the signature against our published ledger before any medication leaves the shelf. The verification is independent of Vellum and is logged immutably.",
    filed: "Filed under · §§01.B · Verification",
  },
  {
    n: "03",
    head: "Dispensed and delivered",
    italic: "by the hour, not the day.",
    body:
      "Standard metro delivery is forty-nine rupees and same-day. Refrigerated medications travel in validated 2 to 8°C containers. Schedule-restricted classes require a signature on receipt, with a one-time code sent at the moment of handover.",
    filed: "Filed under · §§01.C · Fulfilment",
  },
];

const FEES: ReadonlyArray<readonly [string, string]> = [
  ["Standard delivery, metro routes", "₹49"],
  ["Same-day window, two-hour", "₹99"],
  ["Same-day window, ninety-minute", "₹149"],
  ["Refrigerated, validated cold-chain", "₹199"],
  ["Out-of-metro courier, next day", "from ₹179"],
  ["Cancellation, before claim", "free"],
];

const NETWORK: ReadonlyArray<readonly [string, string, string]> = [
  ["Network size", "42 partner pharmacies", "Independent dispensaries across nine metros, vetted quarterly."],
  ["Median time-to-claim", "00:04:18", "From script issue to a pharmacist accepting the queue."],
  ["Median time-to-door", "01:42:00", "Standard same-day window, metro routes."],
  ["Refusal rate", "0.04% YTD", "Forgeries and tampered signatures, refused on verification."],
  ["Cold-chain integrity", "100% YTD", "Validated containers, audited per quarter."],
  ["Audit trail", "Immutable ledger", "Every claim, dispense, and delivery, append-only."],
];

const NOT_DISPENSED = [
  "Schedule II controlled substances",
  "Compounded sterile preparations",
  "Investigational and unapproved drugs",
  "Anything requiring in-person counselling under state law",
];

export default async function PharmacyPage() {
  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>Dispensing</span>
          <span className="meta">A note on how scripts travel</span>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-12 sm:pt-14 pb-16 grid grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-12 lg:col-span-9">
          <p className="eyebrow">Pharmacy network</p>
          <h1 className="serif-display mt-5 text-[clamp(2.75rem,9vw,8rem)]">
            Signed by name.{" "}
            <span className="italic-accent">Filled by hand.</span>
          </h1>
          <p className="mt-7 max-w-[60ch] text-[16.5px] leading-[1.7] text-ink-soft">
            Vellum does not run its own pharmacy. We sign each prescription
            cryptographically and route it to one of forty-two independent
            partners, who verify the signature and dispense it on the metro
            route closest to your address. The handoff is auditable from
            consult to door.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn btn-clay btn-lg">
              Begin your record <span aria-hidden>→</span>
            </Link>
            <Link href="/how-it-works" className="btn-link">
              How a visit runs <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <aside className="col-span-12 lg:col-span-3 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>On verification</strong>
            Pharmacists verify the HMAC of each script against our public
            ledger before any medication leaves the shelf. The check
            does not require contacting Vellum.
          </p>
        </aside>
      </section>

      {/* Stages — numbered */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <div className="masthead mb-12">
            <span>How a script travels · §02</span>
            <span className="meta">Three stages, plain</span>
          </div>

          <ol>
            {STAGES.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-12 gap-x-8 gap-y-4 border-t border-[color:var(--rule)] py-10 sm:py-14 last:border-b last:border-[color:var(--rule)]"
              >
                <div className="col-span-12 md:col-span-2">
                  <span className="numbered block text-[clamp(2rem,4vw,3rem)]">
                    {s.n}
                  </span>
                  <p className="sidenote mt-6">
                    <strong>Filed under</strong>
                    {s.filed.replace("Filed under · ", "")}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-10 lg:col-span-7">
                  <h3 className="serif-section text-[clamp(1.5rem,3.5vw,2.4rem)] max-w-[22ch]">
                    {s.head},{" "}
                    <span className="italic-accent">{s.italic}</span>
                  </h3>
                  <p className="mt-5 max-w-[60ch] text-[15.5px] leading-[1.75] text-ink-soft">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bill of delivery fees */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="eyebrow">Bill of delivery</p>
            <h2 className="serif-section mt-3 text-[clamp(1.85rem,4.5vw,2.85rem)] max-w-[18ch]">
              Every route,{" "}
              <span className="italic-accent">priced.</span>
            </h2>
            <p className="mt-5 max-w-[34ch] text-[14.5px] leading-[1.65] text-ink-soft">
              Delivery is billed at cost. Vellum does not mark up
              fulfilment, and there is no minimum order.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <div role="list">
              {FEES.map(([label, price]) => (
                <div key={label} role="listitem" className="bill !py-4">
                  <span className="label">{label}</span>
                  <span className="leader" aria-hidden />
                  <span className="price tabular">{price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Network ledger */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="eyebrow">On the ledger</p>
            <h2 className="serif-section mt-3 text-[clamp(1.85rem,4.5vw,3rem)] max-w-[20ch]">
              Numbers, kept in{" "}
              <span className="italic-accent">plain view.</span>
            </h2>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.65] text-ink-soft">
              These figures are the same ones we publish to partner
              pharmacists in their quarterly review. We do not keep two
              sets of books for marketing.
            </p>
          </div>
          <dl className="col-span-12 lg:col-span-7 self-start">
            {NETWORK.map(([k, v, note], i) => (
              <div
                key={k}
                className={
                  "grid grid-cols-12 gap-4 py-4 " +
                  (i === 0
                    ? "border-t border-b border-[color:var(--rule)]"
                    : "border-b border-[color:var(--rule)]")
                }
              >
                <dt className="col-span-12 sm:col-span-4 eyebrow text-ink">
                  {k}
                </dt>
                <dd className="col-span-12 sm:col-span-4 mono text-ink text-[13.5px] tabular">
                  {v}
                </dd>
                <dd className="col-span-12 sm:col-span-4 text-[12.5px] text-ink-mute leading-[1.55]">
                  {note}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What is not dispensed */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="eyebrow">Limits of the network</p>
            <h2 className="serif-section mt-3 text-[clamp(1.85rem,4.5vw,2.85rem)] max-w-[20ch]">
              What this network{" "}
              <span className="italic-accent">does not carry.</span>
            </h2>
          </div>
          <dl className="col-span-12 lg:col-span-7 self-start">
            {NOT_DISPENSED.map((item, i) => (
              <div
                key={item}
                className={
                  "grid grid-cols-12 gap-4 py-4 " +
                  (i === 0
                    ? "border-t border-b border-[color:var(--rule)]"
                    : "border-b border-[color:var(--rule)]")
                }
              >
                <dt className="col-span-1 mono text-amber tabular text-[13px] pt-0.5">
                  —
                </dt>
                <dd className="col-span-11 text-ink-soft text-[14.5px] leading-[1.6]">
                  {item}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <h2 className="serif-display text-[clamp(2.25rem,7vw,5rem)] max-w-[20ch]">
            One signature.{" "}
            <span className="italic-accent">One handoff.</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn btn-clay btn-lg">
              Create your account <span aria-hidden>→</span>
            </Link>
            <Link href="/pricing" className="btn-link">
              See the bill <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
