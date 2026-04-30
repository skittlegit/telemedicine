import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import {
  CalendarIcon,
  VideoIcon,
  PillIcon,
} from "../_components/icons";

export const metadata = { title: "How it works — Vellum Health" };

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-24 pb-12">
        <p className="eyebrow mb-3">How it works</p>
        <h1 className="font-display text-[clamp(2rem,8vw,6rem)] leading-[0.98] tracking-[-0.035em] max-w-[20ch] break-words">
          From symptom to{" "}
          <span className="italic-accent">prescription,</span>{" "}
          in three steps, one evening.
        </h1>
        <p className="mt-7 text-ink-soft text-[17px] leading-[1.65] max-w-[58ch]">
          No insurance hoops, no waiting rooms, no fax machines. Vellum is a
          flat-fee, video-first clinic with same-day pharmacy fulfilment.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/register" className="btn btn-clay" prefetch>
            Book a consultation <span aria-hidden>→</span>
          </Link>
          <Link href="/doctors" className="btn btn-ghost" prefetch>
            Browse doctors
          </Link>
        </div>
      </section>

      <hr className="rule mx-5 sm:mx-6 lg:mx-8" />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {[
            {
              n: "01",
              icon: <CalendarIcon />,
              title: "Book",
              italic: "in under a minute",
              body:
                "Pick a clinician by specialty, language, and the next available slot. Pay a flat fee — no insurance hoops.",
              detail:
                "Filter the directory by specialty or language. You'll see real-time availability, the consultation fee, and patient ratings. Booking is one click.",
            },
            {
              n: "02",
              icon: <VideoIcon />,
              title: "Consult",
              italic: "by encrypted video",
              body:
                "Meet 1-on-1 over a HIPAA-aligned video call. Share symptoms, history, photos. Get a real diagnosis.",
              detail:
                "30-minute slot, peer-to-peer video with DTLS-SRTP. Upload photos and prior labs ahead of time so you spend the visit talking, not typing.",
            },
            {
              n: "03",
              icon: <PillIcon />,
              title: "Fulfil",
              italic: "the same day",
              body:
                "Receive a digitally signed prescription. We route it to a verified pharmacy near you for pickup or delivery.",
              detail:
                "Every prescription carries an HMAC-SHA256 signature any pharmacist can verify independently — no faxing, no forgery.",
            },
          ].map((s) => (
            <li key={s.n} className="bg-paper p-7 lg:p-9">
              <div className="flex items-center justify-between">
                <span className="text-clay [&>svg]:w-7 [&>svg]:h-7">{s.icon}</span>
                <span className="mono text-ink-mute text-[12px] tracking-[0.22em]">
                  {s.n}
                </span>
              </div>
              <h3 className="font-display text-[2rem] mt-6 tracking-[-0.025em] leading-[1]">
                {s.title}
              </h3>
              <p className="eyebrow mt-2 text-ink-mute">{s.italic}</p>
              <p className="mt-5 text-ink-soft text-[14.5px] leading-[1.6]">
                {s.body}
              </p>
              <p className="mt-4 text-ink-mute text-[13px] leading-[1.65] border-t border-[color:var(--rule)] pt-4">
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <hr className="rule mx-5 sm:mx-6 lg:mx-8" />

      {/* Pricing band */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-3">Pricing</p>
          <h2 className="font-display text-[clamp(1.6rem,5vw,3.25rem)] tracking-[-0.025em] leading-[1.04] break-words">
            Flat fees. No surprises.
          </h2>
          <p className="mt-6 text-ink-soft text-[15.5px] leading-[1.65] max-w-[48ch]">
            We don&apos;t take insurance directly — we charge one flat fee per
            consultation. You get an itemised receipt for out-of-network
            reimbursement.
          </p>
        </div>
        <dl className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] self-start">
          {[
            ["General practice", "$45"],
            ["Specialist visit", "$70"],
            ["Mental health", "$80"],
            ["Prescription refill", "$25"],
            ["Pharmacy delivery", "from $5"],
            ["Cancellation", "free, anytime"],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-6">
              <dt className="eyebrow mb-2">{k}</dt>
              <dd className="font-display text-[1.4rem] tracking-tight">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pb-24">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-7 sm:p-10 lg:p-14 text-center">
          <h2 className="font-display text-[clamp(1.85rem,6vw,3.5rem)] tracking-[-0.03em] leading-[1.02] max-w-[22ch] mx-auto break-words">
            Ready when you are.{" "}
            <span className="italic-accent">Tonight, even.</span>
          </h2>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link href="/register" className="btn btn-clay" prefetch>
              Create patient account <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
