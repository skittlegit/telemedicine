import Link from "next/link";
import { MarketingHeader, MarketingFooter, Caduceus } from "./_components/MarketingChrome";
import {
  SPECIALTIES,
  CalendarIcon,
  VideoIcon,
  PillIcon,
} from "./_components/icons";

/**
 * Vellum Health landing page.
 * Designer warm-bone aesthetic, framed unambiguously as a telemedicine
 * product: hero with product preview, specialties grid, online clinicians,
 * plain-English "how it works", trust signals, FAQ.
 */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 pt-16 lg:pt-24 pb-20 grid grid-cols-12 gap-x-10 gap-y-14">
        <div className="col-span-12 lg:col-span-7 rise rise-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[color:var(--rule-strong)] bg-paper-tint">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-moss opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
            </span>
            <span className="eyebrow text-ink">14 doctors online now</span>
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,7.5vw,6.5rem)] leading-[0.96] tracking-[-0.035em]">
            See a licensed doctor{" "}
            <span className="italic-accent">in minutes,</span>{" "}
            from anywhere.
          </h1>

          <p className="mt-7 text-ink-soft text-[17px] leading-[1.65] max-w-[58ch]">
            Book a 30-minute video consultation with a board-certified clinician,
            get a digital prescription you can fill the same day, and keep every
            note in one secure record. No commute. No waiting room.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-clay">
              Book a consultation
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn btn-ghost">
              Browse doctors
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] max-w-[560px]">
            {[
              ["30 min", "average wait"],
              ["50+", "specialties"],
              ["HIPAA", "aligned"],
            ].map(([k, v]) => (
              <div key={k} className="bg-paper px-5 py-4">
                <p className="font-display text-[26px] leading-none tracking-[-0.02em]">{k}</p>
                <p className="eyebrow mt-1.5">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-5 rise rise-2">
          <ConsultPreviewCard />
        </aside>
      </section>

      <hr className="rule mx-6 lg:mx-8" />

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div className="max-w-[42ch]">
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] tracking-[-0.025em] leading-[1.02]">
              Three steps from symptom{" "}
              <span className="italic-accent">to prescription.</span>
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
            <li key={s.n} className="bg-paper p-7 lg:p-9">
              <div className="flex items-center justify-between">
                <span className="text-clay [&>svg]:w-7 [&>svg]:h-7">{s.icon}</span>
                <span className="mono text-ink-mute text-[12px] tracking-[0.22em]">{s.n}</span>
              </div>
              <h3 className="font-display text-[2rem] mt-6 tracking-[-0.025em] leading-[1]">
                {s.title}{" "}
                <span className="italic-accent text-[1.2rem]">{s.italic}</span>
              </h3>
              <p className="mt-4 text-ink-soft text-[14.5px] leading-[1.6] max-w-[34ch]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <hr className="rule mx-6 lg:mx-8" />

      {/* ============ SPECIALTIES ============ */}
      <section id="specialties" className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-[44ch]">
            <p className="eyebrow mb-3">What we treat</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] tracking-[-0.025em] leading-[1.02]">
              50+ specialties.{" "}
              <span className="italic-accent">One unhurried visit.</span>
            </h2>
          </div>
          <Link href="/doctors" className="eyebrow hover:text-clay">All specialties →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.name}
              href={`/doctors?specialty=${encodeURIComponent(s.name)}`}
              className="bg-paper p-6 group hover:bg-paper-tint transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-clay [&>svg]:w-6 [&>svg]:h-6">{s.icon}</span>
                <span className="eyebrow text-ink-faint group-hover:text-clay transition-colors">→</span>
              </div>
              <p className="font-display text-[1.35rem] tracking-[-0.02em] leading-[1.05]">{s.name}</p>
              <p className="text-ink-mute text-[12.5px] mt-2 leading-[1.5]">{s.examples}</p>
            </Link>
          ))}
        </div>
      </section>

      <hr className="rule mx-6 lg:mx-8" />

      {/* ============ DOCTORS ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-[44ch]">
            <p className="eyebrow mb-3">Meet the clinicians</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] tracking-[-0.025em] leading-[1.02]">
              Board-certified.{" "}
              <span className="italic-accent">Background-checked.</span>
            </h2>
          </div>
          <Link href="/doctors" className="btn btn-ghost">View all doctors →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {SAMPLE_DOCTORS.map((d) => (
            <article key={d.name} className="bg-paper p-6 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="w-14 h-14 rounded-full bg-clay-wash text-clay font-display text-[20px] flex items-center justify-center tracking-tight"
                  aria-hidden
                >
                  {d.initials}
                </div>
                <span className="inline-flex items-center gap-1.5 eyebrow text-moss">
                  <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                  Online
                </span>
              </div>
              <h3 className="font-display text-[1.5rem] mt-5 tracking-[-0.02em] leading-[1.05]">{d.name}</h3>
              <p className="eyebrow mt-1">{d.specialty}</p>
              <p className="text-ink-soft text-[13.5px] mt-3 leading-[1.55]">{d.bio}</p>
              <div className="mt-5 pt-5 border-t border-[color:var(--rule)] flex items-center justify-between text-[13px]">
                <span className="text-ink-mute">{d.years} yrs · {d.languages.join(", ")}</span>
                <span className="font-display text-[1.1rem] tracking-tight">${d.fee}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <hr className="rule mx-6 lg:mx-8" />

      {/* ============ SECURITY ============ */}
      <section id="security" className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24 grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-3">Privacy &amp; security</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] tracking-[-0.025em] leading-[1.02]">
            Your record is read by you{" "}
            <span className="italic-accent">and your doctor — alone.</span>
          </h2>
          <p className="mt-6 text-ink-soft text-[15.5px] leading-[1.65] max-w-[48ch]">
            Notes, allergies, history, and addresses are encrypted at the field
            level before they touch our database. Prescriptions carry a per-record
            HMAC signature any pharmacist can verify independently.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {["HIPAA-aligned", "SOC 2 controls", "TLS 1.3", "AES-256-GCM"].map((b) => (
              <span key={b} className="px-3 py-1.5 border border-[color:var(--rule-strong)] eyebrow text-ink">
                {b}
              </span>
            ))}
          </div>
        </div>
        <dl className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] self-start">
          {[
            ["Encryption at rest", "AES-256-GCM"],
            ["Encryption in transit", "TLS 1.3"],
            ["Video signalling", "WebRTC · DTLS-SRTP"],
            ["Compliance posture", "HIPAA-aligned"],
            ["Prescription integrity", "HMAC-SHA256"],
            ["Access trail", "Immutable audit log"],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-6">
              <dt className="eyebrow mb-2">{k}</dt>
              <dd className="mono text-ink text-[13.5px]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <hr className="rule mx-6 lg:mx-8" />

      {/* ============ FAQ ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="eyebrow mb-3">Common questions</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] tracking-[-0.025em] leading-[1.02]">
              Before you{" "}
              <span className="italic-accent">book.</span>
            </h2>
          </div>
          <dl className="col-span-12 lg:col-span-8 divide-y divide-[color:var(--rule-strong)] border-y border-[color:var(--rule-strong)]">
            {FAQ.map(([q, a]) => (
              <div key={q} className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <dt className="font-display text-[1.15rem] tracking-[-0.015em] leading-[1.2] md:col-span-1">
                  {q}
                </dt>
                <dd className="text-ink-soft text-[14.5px] leading-[1.65] md:col-span-2">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-10 lg:p-16 text-center">
          <Caduceus className="text-clay mx-auto mb-6" size={40} />
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] tracking-[-0.035em] leading-[1] max-w-[20ch] mx-auto">
            Care, today.{" "}
            <span className="italic-accent">No waiting room.</span>
          </h2>
          <p className="mt-6 text-ink-soft text-[16.5px] max-w-[52ch] mx-auto">
            Create your account in under a minute. Your first consultation can be tonight.
          </p>
          <div className="mt-9 flex justify-center gap-3 flex-wrap">
            <Link href="/register" className="btn btn-clay">
              Create patient account
              <span aria-hidden>→</span>
            </Link>
            <Link href="/register?role=doctor" className="btn btn-ghost">
              I&rsquo;m a clinician
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <MarketingFooter />
    </main>
  );
}

/* ====================================================================
   In-hero "consult" preview card
   ==================================================================== */

function ConsultPreviewCard() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 border border-[color:var(--rule-strong)] bg-paper-deep"
      />
      <div className="relative bg-paper border border-[color:var(--rule-strong)]">
        <div className="px-5 py-3.5 border-b border-[color:var(--rule)] flex items-center justify-between">
          <span className="eyebrow">Upcoming consultation</span>
          <span className="inline-flex items-center gap-1.5 eyebrow text-moss">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            Confirmed
          </span>
        </div>

        <div className="p-5 flex items-start gap-4 border-b border-[color:var(--rule)]">
          <div className="w-12 h-12 rounded-full bg-clay-wash text-clay font-display text-[18px] flex items-center justify-center">
            AR
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[1.25rem] tracking-[-0.015em] leading-tight">Dr. Amelia Reyes</p>
            <p className="eyebrow mt-1">Internal medicine</p>
          </div>
          <span className="font-display text-[1.25rem] tracking-tight">$50</span>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4 border-b border-[color:var(--rule)]">
          <div>
            <p className="eyebrow mb-1">Date</p>
            <p className="text-[14px] text-ink">Tonight, 7:30 PM</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Duration</p>
            <p className="text-[14px] text-ink">30 minutes</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Channel</p>
            <p className="text-[14px] text-ink flex items-center gap-1.5">
              <VideoIcon className="w-3.5 h-3.5 text-clay" />
              Encrypted video
            </p>
          </div>
          <div>
            <p className="eyebrow mb-1">Reason</p>
            <p className="text-[14px] text-ink">Follow-up · BP</p>
          </div>
        </div>

        <div className="p-5 flex items-center justify-between gap-3">
          <span className="mono text-[11px] text-ink-mute">RX-9F2C-3A41</span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost px-3 py-1.5 text-[12px]">Reschedule</button>
            <button type="button" className="btn btn-clay px-3 py-1.5 text-[12px]">
              Join call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   Static content
   ==================================================================== */

const SAMPLE_DOCTORS = [
  {
    initials: "AR",
    name: "Dr. Amelia Reyes",
    specialty: "Internal medicine",
    bio: "Twelve years of primary care. Calm with chronic-condition follow-ups and complex medication histories.",
    years: 12,
    languages: ["English", "Spanish"],
    fee: 50,
  },
  {
    initials: "BS",
    name: "Dr. Ben Stone",
    specialty: "General practice",
    bio: "Family doctor focused on preventive care and acute illness. Known for plain-English explanations.",
    years: 9,
    languages: ["English"],
    fee: 45,
  },
  {
    initials: "CK",
    name: "Dr. Cara Kim",
    specialty: "Dermatology",
    bio: "Photo-led consultations for acne, eczema, and pigment concerns. Same-day prescription routing.",
    years: 7,
    languages: ["English", "Korean"],
    fee: 70,
  },
];

const FAQ: Array<[string, string]> = [
  [
    "Can you actually prescribe medication?",
    "Yes — for most non-controlled medications, a Vellum clinician can issue a digitally signed prescription during your consultation. Controlled substances (e.g., schedule II) require an in-person visit per federal rules.",
  ],
  [
    "Do you take insurance?",
    "Vellum is a flat-fee, cash-pay service starting at $45 per visit. We provide an itemised receipt you can submit to most insurers for out-of-network reimbursement.",
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
