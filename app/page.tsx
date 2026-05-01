import Link from "next/link";
import { redirect } from "next/navigation";
import type React from "react";
import { MarketingHeader, MarketingFooter } from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import { getSession } from "@/lib/authz";
import {
  SPECIALTIES,
  CalendarIcon,
  VideoIcon,
  PillIcon,
} from "@/app/_components/icons";

/**
 * Vellum Health landing page.
 * Logged-in users are redirected to /dashboard — the marketing landing
 * page is for prospects, not authenticated patients/clinicians.
 */
export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
  const headerProps = await marketingHeaderProps();
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      {/* ============ HERO ============ */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 grid grid-cols-12 gap-x-10 gap-y-12">
        <div className="col-span-12 lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[color:var(--rule-strong)] bg-paper-tint rounded-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden />
            <span className="eyebrow text-ink">14 clinicians on call tonight</span>
          </div>

          <h1 className="mt-6 text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] max-w-[18ch]">
            See a licensed doctor in minutes, from anywhere.
          </h1>

          <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[58ch]">
            Book a 30-minute video consultation with a board-certified clinician,
            get a digital prescription you can fill the same day, and keep every
            note in one secure record. No commute. No waiting room.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link href="/register" className="btn btn-clay">
              Register
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn btn-ghost">
              Browse doctors
            </Link>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-5">
          <HeroCalloutCard />
        </aside>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-[42ch]">
            <p className="eyebrow mb-2.5">How it works</p>
            <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
              Three steps from symptom to prescription.
            </h2>
          </div>
          <Link href="/register" className="eyebrow hover:text-clay transition-colors">
            Get started →
          </Link>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {[
            {
              n: "01",
              icon: <CalendarIcon />,
              title: "Book",
              italic: "in under a minute",
              body: "Pick a clinician by specialty, language, and the next available slot. Pay a flat fee — no insurance hoops.",
            },
            {
              n: "02",
              icon: <VideoIcon />,
              title: "Consult",
              italic: "by encrypted video",
              body: "Meet 1-on-1 over a HIPAA-aligned video call. Share symptoms, history, photos. Get a real diagnosis.",
            },
            {
              n: "03",
              icon: <PillIcon />,
              title: "Fulfil",
              italic: "the same day",
              body: "Receive a digitally signed prescription. We route it to a verified pharmacy near you for pickup or delivery.",
            },
          ].map((s) => (
            <li key={s.n} className="bg-paper p-6 lg:p-7">
              <div className="flex items-center justify-between">
                <span className="text-clay [&>svg]:w-6 [&>svg]:h-6">{s.icon}</span>
                <span className="mono text-ink-mute text-[11px] tracking-[0.22em]">{s.n}</span>
              </div>
              <h3 className="text-[18px] mt-5 font-semibold tracking-[-0.014em] leading-[1.25]">
                {s.title}
              </h3>
              <p className="eyebrow mt-1.5 text-ink-mute">{s.italic}</p>
              <p className="mt-4 text-ink-soft text-[13.5px] leading-[1.6] max-w-[34ch]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ SPECIALTIES ============ */}
      <section id="specialties" className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div className="max-w-[44ch]">
            <p className="eyebrow mb-2.5">What we treat</p>
            <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
              50+ specialties. One unhurried visit.
            </h2>
          </div>
          <Link href="/doctors" className="eyebrow hover:text-clay">All specialties →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.name}
              href={`/specialties/${s.slug}`}
              className="bg-paper p-5 group hover:bg-paper-tint transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-clay [&>svg]:w-5 [&>svg]:h-5">{s.icon}</span>
                <span className="eyebrow text-ink-faint group-hover:text-clay transition-colors">→</span>
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.012em] leading-[1.25]">{s.name}</p>
              <p className="text-ink-mute text-[12.5px] mt-1.5 leading-[1.5]">{s.examples}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ DOCTORS section removed: directory at /doctors ============ */}

      {/* ============ SECURITY ============ */}
      <section id="security" className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-14 sm:py-16 grid grid-cols-12 gap-x-10 gap-y-8">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-2.5">Privacy &amp; security</p>
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
            Your record is read by you, and your doctor. Alone.
          </h2>
          <p className="mt-5 text-ink-soft text-[14.5px] leading-[1.65] max-w-[48ch]">
            Notes, allergies, history, and addresses are encrypted at the field
            level before they touch our database. Prescriptions carry a per-record
            HMAC signature any pharmacist can verify independently.
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {["HIPAA-aligned", "SOC 2 controls", "TLS 1.3", "AES-256-GCM"].map((b) => (
              <span key={b} className="px-2.5 py-1 border border-[color:var(--rule-strong)] eyebrow text-ink rounded-sm">
                {b}
              </span>
            ))}
          </div>
        </div>
        <dl className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] self-start">
          {[
            ["Encryption at rest", "AES-256-GCM"],
            ["Encryption in transit", "TLS 1.3"],
            ["Video signalling", "WebRTC · DTLS-SRTP"],
            ["Compliance posture", "HIPAA-aligned"],
            ["Prescription integrity", "HMAC-SHA256"],
            ["Access trail", "Immutable audit log"],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-5">
              <dt className="eyebrow mb-1.5">{k}</dt>
              <dd className="mono text-ink text-[13px]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ============ FAQ ============ */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="eyebrow mb-2.5">Common questions</p>
            <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
              Before you book.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-8 border-y border-[color:var(--rule-strong)] divide-y divide-[color:var(--rule)]">
            {FAQ.map(([q, a], i) => (
              <details
                key={q}
                {...(i === 0 ? { open: true } : {})}
                className="group py-4"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-[14.5px] font-semibold tracking-[-0.01em] leading-[1.35]">
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-mute group-open:rotate-45 transition-transform text-[18px] leading-none"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-ink-soft text-[13.5px] leading-[1.65]">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-8 sm:p-12 text-center rounded-sm">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.022em] leading-[1.2] max-w-[24ch] mx-auto">
            Care, today. No waiting room.
          </h2>
          <div className="mt-7 flex justify-center">
            <Link href="/register" className="btn btn-clay">
              Create your account
              <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-4 text-ink-mute text-[13px]">
            Takes under a minute. Your first visit can be tonight.
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}

/* ====================================================================
   In-hero callout card — what you get with Vellum, no fake account state.
   ==================================================================== */

function HeroCalloutCard() {
  const features: Array<[React.ReactNode, string, string]> = [
    [<CalendarIcon key="c" />, "Same-day booking", "Slots open every 30 minutes, evenings and weekends."],
    [<VideoIcon key="v" />, "Encrypted video", "HIPAA-aligned, no install — runs in your browser."],
    [<PillIcon key="p" />, "Pharmacy fulfilment", "We route signed scripts to a verified pharmacy near you."],
  ];
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 sm:translate-x-3 sm:translate-y-3 border border-[color:var(--rule-strong)] bg-paper-deep"
      />
      <div className="relative bg-paper border border-[color:var(--rule-strong)]">
        <div className="px-5 py-3.5 border-b border-[color:var(--rule)] flex items-center justify-between">
          <span className="eyebrow">What you get</span>
          <span className="inline-flex items-center gap-1.5 eyebrow text-moss">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            Live tonight
          </span>
        </div>
        <ul className="divide-y divide-[color:var(--rule)]">
          {features.map(([icon, title, body]) => (
            <li key={title} className="p-5 flex items-start gap-4">
              <span className="text-clay [&>svg]:w-5 [&>svg]:h-5 mt-0.5 shrink-0">
                {icon}
              </span>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.012em] leading-tight">
                  {title}
                </p>
                <p className="text-ink-soft text-[13px] mt-1.5 leading-[1.55] max-w-[40ch]">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-4 flex items-center justify-between gap-3 border-t border-[color:var(--rule)]">
          <span className="mono text-[11px] text-ink-mute">From ₹499 / consult</span>
          <Link href="/register" className="btn btn-clay btn-sm">
            Get started →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   Static content
   ==================================================================== */

const FAQ: Array<[string, string]> = [
  [
    "Can you actually prescribe medication?",
    "Yes — for most non-controlled medications, a Vellum clinician can issue a digitally signed prescription during your consultation. Controlled substances (e.g., schedule II) require an in-person visit per federal rules.",
  ],
  [
    "Do you take insurance?",
    "Vellum is a flat-fee, cash-pay service starting at ₹499 per visit. We provide an itemised receipt you can submit to most insurers for out-of-network reimbursement.",
  ],
  [
    "Is my information really private?",
    "Every clinical field is encrypted before storage with AES-256-GCM, and access is logged immutably. Your doctor and you are the only people who can decrypt your record.",
  ],
  [
    "What if I need to be seen in person?",
    "If your clinician determines an in-person exam is necessary, they will refer you to a local provider and your consultation fee is fully refunded.",
  ],
];
