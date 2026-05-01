import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";

export const metadata = {
  title: "Pricing — Vellum Health",
  description:
    "Flat-fee video consultations and pharmacy delivery. No insurance hoops, no surprise bills.",
};

const TIERS: Array<[string, string, string]> = [
  ["General practice", "$45", "20-minute video consult with a board-certified GP."],
  ["Specialist visit", "$70", "30-minute consult with a specialist clinician."],
  ["Mental health", "$80", "45-minute talk session with a licensed therapist."],
  ["Prescription refill", "$25", "Async script renewal — no consult needed if stable."],
  ["Pharmacy delivery", "from $5", "Same-day, signature on receipt where required."],
  ["Cancellation", "free, anytime", "Reschedule or cancel up to the appointment."],
];

const FAQ: Array<[string, string]> = [
  [
    "Do you take insurance?",
    "Not directly. We charge a single flat fee per consult and email you an itemised superbill suitable for out-of-network reimbursement with most carriers.",
  ],
  [
    "What does the consult fee include?",
    "The video session, your clinician's notes, any prescriptions written during the visit, and a follow-up message thread for 48 hours after.",
  ],
  [
    "How does pharmacy delivery work?",
    "Once your clinician issues a script, our pharmacist network claims it within minutes. Standard delivery is $5; same-day in metro zones runs $9 – $15 depending on distance.",
  ],
  [
    "Can I get a receipt for HSA / FSA?",
    "Yes — every charge generates an itemised receipt with diagnostic codes, ready for HSA, FSA, or out-of-network claims.",
  ],
];

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader />

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10">
        <p className="eyebrow mb-2.5">Pricing</p>
        <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] max-w-[22ch]">
          Flat fees. No surprises. No insurance theatre.
        </h1>
        <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[58ch]">
          One charge per consult, billed at the time of booking. We email an
          itemised superbill for out-of-network reimbursement — no deductibles,
          no copay roulette, no claim forms.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href="/register" className="btn btn-clay" prefetch>
            Create patient account <span aria-hidden>→</span>
          </Link>
          <Link href="/doctors" className="btn btn-ghost" prefetch>
            Browse doctors
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-14">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {TIERS.map(([k, v, hint]) => (
            <div key={k} className="bg-paper p-6">
              <dt className="eyebrow mb-1.5">{k}</dt>
              <dd>
                <div className="text-[26px] font-semibold tracking-[-0.014em] leading-none">
                  {v}
                </div>
                <p className="mt-3 text-ink-soft text-[13.5px] leading-[1.6] border-t border-[color:var(--rule)] pt-3">
                  {hint}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-14 grid grid-cols-12 gap-x-10 gap-y-8">
        <div className="col-span-12 lg:col-span-4">
          <p className="eyebrow mb-2.5">FAQ</p>
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2] max-w-[18ch]">
            Practical questions, plainly answered.
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-8 divide-y divide-[color:var(--rule)] border-t border-[color:var(--rule)]">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-medium text-[15px] tracking-[-0.005em]">
                {q}
                <span
                  aria-hidden
                  className="mono text-ink-mute text-[14px] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-ink-soft text-[14px] leading-[1.65] max-w-[60ch]">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-20">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-8 sm:p-12 text-center">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.022em] leading-[1.2] max-w-[26ch] mx-auto">
            One flat fee. One evening. One signed script.
          </h2>
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            <Link href="/register" className="btn btn-clay" prefetch>
              Get care tonight <span aria-hidden>→</span>
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost" prefetch>
              How it works
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
