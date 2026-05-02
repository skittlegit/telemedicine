import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";

export const metadata = { title: "How a visit runs · Vellum Health" };

const STEPS: ReadonlyArray<{
  n: string;
  head: string;
  italic: string;
  body: string;
  detail: string;
  filed: string;
}> = [
  {
    n: "01",
    head: "Book a clinician,",
    italic: "in under a minute.",
    body:
      "Filter the directory by specialty, language, or the next open slot. Pay the flat fee and the room is yours, opening on the hour.",
    detail:
      "No insurance pre-authorisation, no triage questionnaire. The booking page asks for nothing the visit will not need. Cancel free up to the slot opening.",
    filed: "Booking · /book/[doctor]",
  },
  {
    n: "02",
    head: "Speak to a clinician,",
    italic: "by encrypted video.",
    body:
      "Thirty minutes, one to one, on a HIPAA-aligned WebRTC channel. Photos and prior labs can be shared inside the consult.",
    detail:
      "Video uses DTLS-SRTP end-to-end on the consult leg; no clinical media is recorded on our servers. Notes are typed by the clinician while you watch and confirm.",
    filed: "Consult · /consult/[appointment]",
  },
  {
    n: "03",
    head: "Have it filled,",
    italic: "the same day.",
    body:
      "Prescriptions carry an HMAC signature any pharmacist can verify against our public ledger. We route them to a partner pharmacy near you.",
    detail:
      "Pickup or delivery, your choice at checkout. Pharmacy fulfilment is at cost, separate from the consultation fee. Most metro orders arrive within hours.",
    filed: "Pharmacy · /pharmacy/order",
  },
];

const FEES: ReadonlyArray<{ label: string; price: string }> = [
  { label: "General practice consultation", price: "₹499" },
  { label: "Specialist consultation", price: "₹899" },
  { label: "Mental health, fifty minutes", price: "₹1,199" },
  { label: "Pharmacy delivery, metro routes", price: "from ₹49" },
];

export default async function HowItWorksPage() {
  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>How a visit runs</span>
          <span className="meta">Three steps · One evening</span>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-12 sm:pt-16 lg:pt-20 pb-14 grid grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-12 lg:col-span-9">
          <p className="eyebrow">A method statement</p>
          <h1 className="serif-display mt-5 text-[clamp(2.75rem,8vw,6.5rem)]">
            From a symptom to a prescription,{" "}
            <span className="italic-accent">in one evening.</span>
          </h1>
          <p className="mt-7 max-w-[58ch] text-[16.5px] leading-[1.65] text-ink-soft">
            No insurance hoops. No fax machines. No second visit to confirm
            the first. The page below describes, plainly, what happens
            between the moment you book and the moment a pharmacist reads
            your prescription.
          </p>
        </div>
        <aside className="col-span-12 lg:col-span-3 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>On timing</strong>
            Slots open on the hour. The clinic operates 19:00 to 02:00 IST,
            every night of the year. Most consultations begin within
            fifteen minutes of booking.
          </p>
        </aside>
      </section>

      {/* Numbered features, long-form */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <ol className="space-y-16 sm:space-y-24">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="grid grid-cols-12 gap-x-8 gap-y-6 border-t border-[color:var(--rule)] pt-10 sm:pt-14"
              >
                <div className="col-span-12 md:col-span-3">
                  <span className="numbered block">{s.n}</span>
                  <p className="sidenote mt-6">
                    <strong>Filed under</strong>
                    {s.filed}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-9 lg:col-span-8">
                  <h2 className="serif-section text-[clamp(1.75rem,4vw,2.6rem)] max-w-[24ch]">
                    {s.head}{" "}
                    <span className="italic-accent">{s.italic}</span>
                  </h2>
                  <p className="mt-6 max-w-[60ch] text-[16px] leading-[1.7] text-ink-soft">
                    {s.body}
                  </p>
                  <p className="mt-4 max-w-[60ch] text-[14.5px] leading-[1.7] text-ink-mute">
                    {s.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bill of fees */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 md:col-span-4">
            <p className="eyebrow">Bill of fees</p>
            <h2 className="serif-section mt-3 text-[clamp(1.75rem,4vw,2.6rem)] max-w-[18ch]">
              Flat. And{" "}
              <span className="italic-accent">finished.</span>
            </h2>
            <p className="mt-5 max-w-[36ch] text-[14.5px] leading-[1.65] text-ink-soft">
              Vellum is cash-pay. Each price below is the entire fee for the
              consultation, with prescription, encrypted record, and
              follow-up message included.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <div role="list">
              {FEES.map((row) => (
                <div key={row.label} className="bill" role="listitem">
                  <span className="label">{row.label}</span>
                  <span className="leader" aria-hidden />
                  <span className="price tabular">{row.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <h2 className="serif-display text-[clamp(2.25rem,7vw,5rem)] max-w-[18ch]">
            Ready when you are.{" "}
            <span className="italic-accent">Tonight, even.</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn btn-clay btn-lg">
              Create your account
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn-link">
              Browse the practice
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
