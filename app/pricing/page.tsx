import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";

export const metadata = {
  title: "Pricing · Vellum Health",
  description:
    "Flat-fee video consultations and pharmacy delivery. No insurance theatre.",
};

const TIERS: ReadonlyArray<{
  label: string;
  price: string;
  detail: string;
}> = [
  {
    label: "General practice consultation",
    price: "₹499",
    detail: "Twenty-minute video visit with a board-certified GP.",
  },
  {
    label: "Specialist consultation",
    price: "₹899",
    detail: "Thirty-minute consult with a credentialed specialist.",
  },
  {
    label: "Mental health, fifty minutes",
    price: "₹1,199",
    detail: "Therapy session with a licensed mental-health clinician.",
  },
  {
    label: "Prescription refill, asynchronous",
    price: "₹299",
    detail: "Renewal where the case is stable; no consult required.",
  },
  {
    label: "Pharmacy delivery, metro routes",
    price: "from ₹49",
    detail: "Same-day, signature on receipt where required.",
  },
  {
    label: "Cancellation, anytime before slot",
    price: "free",
    detail: "Reschedule or cancel up to the moment the room opens.",
  },
];

const ABOVE_LINE = [
  "The video consultation, in full",
  "Clinician notes, archived and encrypted",
  "Any prescriptions written during the visit",
  "A forty-eight-hour follow-up message thread",
  "An itemised receipt for out-of-network reimbursement",
];

const BELOW_LINE = [
  "Imaging and laboratory work, when referred",
  "Pharmacy delivery, billed at cost",
  "In-person referrals, when the visit calls for one",
];

export default async function PricingPage() {
  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col text-ink">
      <MarketingHeader {...headerProps} />

      {/* COMMITTED hero — clay-deep ground, paper text */}
      <section
        className="relative"
        style={{ backgroundColor: "var(--clay-deep)", color: "var(--paper)" }}
      >
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
          <div
            className="masthead"
            style={{
              borderTopColor: "var(--paper)",
              color: "var(--paper)",
            }}
          >
            <span>Pricing</span>
            <span className="meta" style={{ color: "rgba(244,241,233,0.7)" }}>
              Flat · Cash-pay · No insurance theatre
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-12 sm:pt-16 pb-20 sm:pb-28 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-9">
            <p
              className="mono text-[11px] tracking-[0.16em] uppercase"
              style={{ color: "rgba(244,241,233,0.65)" }}
            >
              One charge, billed at booking
            </p>
            <h1 className="serif-display mt-5 text-[clamp(3rem,11vw,9rem)]">
              Flat fees.{" "}
              <span
                className="italic-accent"
                style={{ color: "var(--paper)", opacity: 0.85 }}
              >
                No surprises.
              </span>
            </h1>
            <p
              className="mt-7 max-w-[58ch] text-[16.5px] leading-[1.65]"
              style={{ color: "rgba(244,241,233,0.85)" }}
            >
              We do not bill insurance, and we do not run claims theatre.
              Each consultation is one charge, paid at the time of booking.
              You receive an itemised receipt suitable for out-of-network
              reimbursement with most carriers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/register"
                className="btn btn-lg"
                style={{
                  backgroundColor: "var(--paper)",
                  color: "var(--clay-deep)",
                  borderColor: "var(--paper)",
                }}
              >
                Create your account <span aria-hidden>→</span>
              </Link>
              <Link
                href="/doctors"
                className="text-[14px] inline-flex items-center gap-1.5"
                style={{ color: "var(--paper)" }}
              >
                Browse the practice <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <aside
            className="col-span-12 lg:col-span-3 lg:pl-8 lg:border-l"
            style={{ borderColor: "rgba(244,241,233,0.25)" }}
          >
            <p
              className="mono text-[11px] tracking-[0.16em] uppercase mb-3"
              style={{ color: "rgba(244,241,233,0.7)" }}
            >
              On the bill
            </p>
            <p
              className="mono text-[12.5px] leading-[1.6]"
              style={{ color: "rgba(244,241,233,0.78)" }}
            >
              Every fee on this page is the entire fee for that line item.
              Pharmacy fulfilment is the only line we bill at cost; we do
              not mark it up.
            </p>
          </aside>
        </div>
      </section>

      {/* Bill of fees — paper ground, mono-tabular */}
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="eyebrow">Bill of fees</p>
            <h2 className="serif-section mt-3 text-[clamp(1.85rem,4.5vw,2.85rem)] max-w-[18ch]">
              Every line,{" "}
              <span className="italic-accent">visible.</span>
            </h2>
            <p className="mt-5 max-w-[36ch] text-[14.5px] leading-[1.65] text-ink-soft">
              The list below is the complete pricing surface. There is no
              hidden tier, no enterprise plan, no upsell at checkout.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <div role="list">
              {TIERS.map((row) => (
                <div key={row.label} role="listitem" className="bill !py-4">
                  <span className="label">
                    {row.label}
                    <span className="block mono text-[11px] tracking-[0.12em] uppercase text-ink-mute mt-1.5">
                      {row.detail}
                    </span>
                  </span>
                  <span className="leader" aria-hidden />
                  <span className="price tabular">{row.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Above the line / below the line */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <div className="masthead mb-6">
              <span>Above the line</span>
              <span className="meta">Included</span>
            </div>
            <ul>
              {ABOVE_LINE.map((s) => (
                <li
                  key={s}
                  className="grid grid-cols-12 gap-3 py-4 border-b border-[color:var(--rule)] text-[15px]"
                >
                  <span aria-hidden className="col-span-1 mono text-moss text-[14px] tabular pt-0.5">
                    ✓
                  </span>
                  <span className="col-span-11 text-ink leading-[1.55]">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <div className="masthead mb-6">
              <span>Below the line</span>
              <span className="meta">Billed separately</span>
            </div>
            <ul>
              {BELOW_LINE.map((s) => (
                <li
                  key={s}
                  className="grid grid-cols-12 gap-3 py-4 border-b border-[color:var(--rule)] text-[15px]"
                >
                  <span aria-hidden className="col-span-1 mono text-amber text-[14px] tabular pt-0.5">
                    —
                  </span>
                  <span className="col-span-11 text-ink-soft leading-[1.55]">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
            <p className="sidenote mt-8">
              <strong>HSA, FSA, reimbursement</strong>
              Every charge generates an itemised receipt with diagnostic
              codes, ready for HSA, FSA, or out-of-network claims with
              most carriers.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <h2 className="serif-display text-[clamp(2.25rem,7vw,5rem)] max-w-[20ch]">
            One fee.{" "}
            <span className="italic-accent">One signed script.</span>
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
