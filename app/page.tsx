import Link from "next/link";

/**
 * Vellum Health landing page — editorial design language.
 * Bone surfaces, aubergine ink, Fraunces display, italic accents.
 */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      {/* ============ NAV ============ */}
      <header className="border-b border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1280px] px-8 py-5 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-[26px] tracking-[-0.02em] leading-none">
              Vellum<span className="italic-accent"> Health</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-9 eyebrow">
            <Link href="/doctors" className="hover:text-clay transition-colors">Clinicians</Link>
            <Link href="/#how" className="hover:text-clay transition-colors">Method</Link>
            <Link href="/#security" className="hover:text-clay transition-colors">Security</Link>
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/login" className="eyebrow hover:text-clay transition-colors">Sign in</Link>
            <Link href="/register" className="btn">Begin</Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-8 pt-20 pb-24 grid grid-cols-12 gap-x-10 gap-y-12">
        <div className="col-span-12 lg:col-span-8 rise rise-1">
          <p className="eyebrow">A practice of remote medicine</p>
          <h1 className="mt-6 font-display text-[clamp(3.25rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.035em]">
            Care that meets you{" "}
            <span className="italic-accent">where you are.</span>
          </h1>
          <div className="mt-10 grid grid-cols-12 gap-x-10">
            <p className="col-span-12 md:col-span-7 text-ink-soft text-[17px] leading-[1.65]">
              Vellum Health is a closed circuit between you and licensed clinicians.
              Book a thirty-minute consultation, meet over end-to-end encrypted video,
              and receive a cryptographically signed prescription you can fill the same
              day at any participating pharmacy.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 rise rise-2">
            <Link href="/register" className="btn btn-clay">
              Begin a consultation
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn btn-ghost">Browse the directory</Link>
          </div>
        </div>

        {/* Right column: editorial side-note */}
        <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-[color:var(--rule)] rise rise-3">
          <p className="eyebrow mb-4">Note from the editor</p>
          <p className="text-[15.5px] leading-[1.7] text-ink-soft">
            Most telemedicine reads like a pharmaceutical advertisement. We have set
            ours in a serif &mdash; on the conviction that{" "}
            <span className="italic-accent">gravity, in matters of one&rsquo;s body, is a feature.</span>
          </p>
          <hr className="rule my-6" />
          <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-[13px]">
            <dt className="eyebrow">Encryption</dt>
            <dd className="mono text-ink">AES-256-GCM</dd>
            <dt className="eyebrow">Signalling</dt>
            <dd className="mono text-ink">DTLS-SRTP</dd>
            <dt className="eyebrow">Compliance</dt>
            <dd className="mono text-ink">HIPAA-aligned</dd>
            <dt className="eyebrow">Audit</dt>
            <dd className="mono text-ink">Immutable log</dd>
          </dl>
        </aside>
      </section>

      <hr className="rule mx-8" />

      {/* ============ METHOD / TABLE OF CONTENTS ============ */}
      <section id="how" className="mx-auto w-full max-w-[1280px] px-8 py-24">
        <div className="flex flex-wrap items-baseline justify-between gap-6 mb-14 rise rise-3">
          <div>
            <p className="eyebrow mb-3">The method</p>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] tracking-[-0.025em] max-w-[16ch]">
              From booking to medication, in one continuous flow.
            </h2>
          </div>
          <p className="eyebrow tabular-nums">Three&nbsp;movements</p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {[
            {
              n: "i",
              title: "Book",
              italic: "by appointment",
              body: "Choose a clinician by specialty and availability. Thirty-minute appointments. No waiting room.",
            },
            {
              n: "ii",
              title: "Consult",
              italic: "in confidence",
              body: "Meet over encrypted video. Your clinician documents the visit directly into your record.",
            },
            {
              n: "iii",
              title: "Fulfil",
              italic: "the same day",
              body: "Prescriptions are HMAC-signed and routed to a verified pharmacy. Pay in escrow; receive at the door.",
            },
          ].map((s) => (
            <li key={s.n} className="bg-paper p-8 lg:p-10">
              <p className="mono text-clay text-[12px] tracking-[0.22em] uppercase">{s.n}</p>
              <h3 className="font-display text-[2.25rem] mt-3 tracking-[-0.025em] leading-[1]">
                {s.title}{" "}
                <span className="italic-accent text-[1.4rem]">{s.italic}</span>
              </h3>
              <p className="mt-5 text-ink-soft text-[14.5px] leading-[1.65] max-w-[34ch]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <hr className="rule mx-8" />

      {/* ============ SECURITY ============ */}
      <section id="security" className="mx-auto w-full max-w-[1280px] px-8 py-24 grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-3">Security &amp; privacy</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] tracking-[-0.025em] leading-[1.02]">
            Built so your records are read by you{" "}
            <span className="italic-accent">and your clinician alone.</span>
          </h2>
          <p className="mt-6 text-ink-soft text-[15.5px] leading-[1.65] max-w-[48ch]">
            Every clinical note, allergy, history, and address is encrypted at the field
            level before it touches the database. Prescriptions carry a per-record HMAC
            any pharmacist can verify independently.
          </p>
        </div>
        <dl className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] self-start">
          {[
            ["Encryption", "AES-256-GCM"],
            ["Transport", "TLS 1.3"],
            ["Signalling", "WebRTC · DTLS-SRTP"],
            ["Compliance", "HIPAA-aligned"],
            ["Prescriptions", "HMAC-SHA256 signed"],
            ["Audit", "Immutable log"],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-6">
              <dt className="eyebrow mb-2">{k}</dt>
              <dd className="mono text-ink text-[14px]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <hr className="rule mx-8" />

      {/* ============ CTA ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-8 py-28 text-center">
        <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] tracking-[-0.035em] leading-[0.98] max-w-[18ch] mx-auto">
          Ready when you are.{" "}
          <span className="italic-accent">No waiting room.</span>
        </h2>
        <p className="mt-7 text-ink-soft text-[16.5px] max-w-[52ch] mx-auto">
          Create an account in under a minute. Your first consultation can be tonight.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/register" className="btn btn-clay">
            Create account
            <span aria-hidden>→</span>
          </Link>
          <Link href="/doctors" className="btn btn-ghost">See clinicians</Link>
        </div>
      </section>

      {/* ============ COLOPHON ============ */}
      <footer className="mt-auto border-t border-[color:var(--rule-strong)]">
        <div className="mx-auto w-full max-w-[1280px] px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-[22px] tracking-[-0.02em] leading-none">
              Vellum<span className="italic-accent"> Health</span>
            </Link>
            <p className="mt-3 text-ink-mute text-[13px] leading-[1.65] max-w-[34ch]">
              A practice of remote medicine. Encrypted, signed, and licensed.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Patients</p>
            <ul className="space-y-1.5 text-[13.5px] text-ink-soft">
              <li><Link className="hover:text-clay" href="/register">Create account</Link></li>
              <li><Link className="hover:text-clay" href="/doctors">Find a clinician</Link></li>
              <li><Link className="hover:text-clay" href="/dashboard">Your ledger</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Clinicians</p>
            <ul className="space-y-1.5 text-[13.5px] text-ink-soft">
              <li><Link className="hover:text-clay" href="/login">Practitioner sign-in</Link></li>
              <li><Link className="hover:text-clay" href="/register?role=doctor">Apply to practise</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">In the foundry</p>
            <p className="mono text-[12px] text-ink-mute leading-[1.7]">
              build · 0.1.0<br />
              status · <span className="text-moss">operational</span>
            </p>
          </div>
        </div>
        <div className="border-t border-[color:var(--rule)]">
          <div className="mx-auto w-full max-w-[1280px] px-8 py-4 flex flex-wrap items-center justify-between gap-3 eyebrow">
            <span>© 2026 Vellum Health · all rights reserved</span>
            <span>Portfolio implementation. Not a real medical service.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
