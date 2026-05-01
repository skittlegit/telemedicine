import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";
import {
  CalendarIcon,
  VideoIcon,
  PillIcon,
} from "../_components/icons";

export const metadata = { title: "How it works — Vellum Health" };

export default async function HowItWorksPage() {
  const headerProps = await marketingHeaderProps();
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10">
        <p className="eyebrow mb-2.5">How it works</p>
        <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] max-w-[22ch]">
          From symptom to prescription, in three steps, one evening.
        </h1>
        <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[58ch]">
          No insurance hoops, no waiting rooms, no fax machines. Vellum is a
          flat-fee, video-first clinic with same-day pharmacy fulfilment.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href="/register" className="btn btn-clay" prefetch>
            Book a consultation <span aria-hidden>→</span>
          </Link>
          <Link href="/doctors" className="btn btn-ghost" prefetch>
            Browse doctors
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14">
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
            <li key={s.n} className="bg-paper p-6 lg:p-7">
              <div className="flex items-center justify-between">
                <span className="text-clay [&>svg]:w-6 [&>svg]:h-6">{s.icon}</span>
                <span className="mono text-ink-mute text-[11px] tracking-[0.22em]">
                  {s.n}
                </span>
              </div>
              <h3 className="text-[18px] mt-5 font-semibold tracking-[-0.014em] leading-[1.25]">
                {s.title}
              </h3>
              <p className="eyebrow mt-1.5 text-ink-mute">{s.italic}</p>
              <p className="mt-4 text-ink-soft text-[13.5px] leading-[1.6]">
                {s.body}
              </p>
              <p className="mt-3 text-ink-mute text-[12.5px] leading-[1.65] border-t border-[color:var(--rule)] pt-3">
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-12 gap-x-10 gap-y-8">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-2.5">Pricing</p>
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
            Flat fees. No surprises.
          </h2>
          <p className="mt-5 text-ink-soft text-[14.5px] leading-[1.65] max-w-[48ch]">
            We don&apos;t take insurance directly — we charge one flat fee per
            consultation. You get an itemised receipt for out-of-network
            reimbursement.
          </p>
          <Link
            href="/pricing"
            className="btn btn-ghost mt-6 inline-flex"
            prefetch
          >
            See full pricing <span aria-hidden>→</span>
          </Link>
        </div>
        <dl className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] self-start">
          {[
            ["General practice", "₹499"],
            ["Specialist visit", "₹899"],
            ["Mental health", "₹1,199"],
            ["Pharmacy delivery", "from ₹49"],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-5">
              <dt className="eyebrow mb-1.5">{k}</dt>
              <dd className="text-[18px] font-semibold tracking-[-0.014em]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-20">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-8 sm:p-12 text-center rounded-sm">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.022em] leading-[1.2] max-w-[24ch] mx-auto">
            Ready when you are. Tonight, even.
          </h2>
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            <Link href="/register" className="btn btn-clay" prefetch>
              Create patient account <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
