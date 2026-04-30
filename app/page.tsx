import Link from "next/link";

/**
 * Vellum Health landing page — modern violet brand.
 */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      {/* ============ NAV ============ */}
      <header className="border-b border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1240px] px-8 py-5 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span aria-hidden className="inline-block h-7 w-7 rounded-lg bg-clay" />
            <span className="font-display text-xl tracking-tight">Vellum<span className="italic-accent"> Health</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[14px] text-ink-soft">
            <Link href="/doctors" className="hover:text-clay transition-colors">Clinicians</Link>
            <Link href="/#how" className="hover:text-clay transition-colors">How it works</Link>
            <Link href="/#security" className="hover:text-clay transition-colors">Security</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[14px] text-ink-soft hover:text-clay transition-colors">Sign in</Link>
            <Link href="/register" className="btn">Get started</Link>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="mx-auto w-full max-w-[1240px] px-8 pt-20 pb-24 grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-7 rise rise-1">
          <span className="stamp mb-6">Telemedicine, modernised</span>
          <h1 className="font-display text-[clamp(2.75rem,6.4vw,5.25rem)] leading-[1.02] tracking-[-0.035em]">
            Care that meets you{" "}
            <span className="italic-accent">where you are.</span>
          </h1>
          <p className="mt-6 max-w-[54ch] text-ink-soft text-[17px] leading-[1.6]">
            Book a licensed clinician, meet over end-to-end encrypted video, and receive a
            cryptographically signed prescription you can fill at any participating pharmacy —
            often the same day.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 rise rise-2">
            <Link href="/register" className="btn">
              Start a consultation
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn btn-ghost">
              Browse clinicians
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-ink-mute">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> HIPAA-aligned</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> AES-256-GCM at rest</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> Licensed clinicians</span>
          </div>
        </div>

        {/* Right column: product preview card */}
        <aside className="col-span-12 lg:col-span-5 lg:pl-4 rise rise-3">
          <div className="card">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Today · 14:30</p>
              <span className="stamp">Live</span>
            </div>
            <hr className="rule my-5" />
            <div className="flex items-center gap-4">
              <div aria-hidden className="h-12 w-12 rounded-full bg-clay-wash flex items-center justify-center font-display text-clay-deep">AM</div>
              <div>
                <p className="font-display text-lg leading-tight">Dr. Amelia Marston</p>
                <p className="text-[13px] text-ink-mute">Internal Medicine · 30 min</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-lg bg-paper-tint border border-[color:var(--rule)] p-3">
                <p className="eyebrow mb-1">Encryption</p>
                <p className="mono text-ink">AES-256-GCM</p>
              </div>
              <div className="rounded-lg bg-paper-tint border border-[color:var(--rule)] p-3">
                <p className="eyebrow mb-1">Signalling</p>
                <p className="mono text-ink">DTLS-SRTP</p>
              </div>
              <div className="rounded-lg bg-paper-tint border border-[color:var(--rule)] p-3">
                <p className="eyebrow mb-1">Identity</p>
                <p className="mono text-ink">Verified</p>
              </div>
              <div className="rounded-lg bg-paper-tint border border-[color:var(--rule)] p-3">
                <p className="eyebrow mb-1">Audit</p>
                <p className="mono text-ink">Immutable</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Link href="/register" className="btn flex-1 justify-center">Join call</Link>
              <Link href="/doctors" className="btn btn-ghost flex-1 justify-center">Reschedule</Link>
            </div>
          </div>
        </aside>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="border-t border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1240px] px-8 py-20">
          <div className="flex items-baseline justify-between mb-12">
            <div>
              <p className="eyebrow mb-3">How it works</p>
              <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] tracking-[-0.025em] max-w-[18ch]">
                From booking to medication, in one continuous flow.
              </h2>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Book",
                body: "Choose a clinician by specialty and availability. Thirty-minute appointments, no waiting room.",
              },
              {
                n: "02",
                title: "Consult",
                body: "Meet over end-to-end encrypted video. Your clinician documents the visit directly into your record.",
              },
              {
                n: "03",
                title: "Fulfil",
                body: "Prescriptions are HMAC-signed and routed to a verified pharmacy. Pay in escrow; receive at your door.",
              },
            ].map((s) => (
              <li key={s.n} className="card">
                <p className="mono text-clay-deep text-[13px] tracking-[0.18em]">{s.n}</p>
                <h3 className="font-display text-2xl mt-3 tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 text-ink-soft text-[14.5px] leading-[1.6]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ SECURITY ============ */}
      <section id="security" className="border-t border-[color:var(--rule)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1240px] px-8 py-20 grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="eyebrow mb-3">Security &amp; privacy</p>
            <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] tracking-[-0.025em]">
              Built so your records are read only by you and your clinician.
            </h2>
            <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[48ch]">
              Every clinical note, allergy, history, and address is encrypted at the field level
              before it touches the database. Prescriptions carry a per-record HMAC any pharmacist
              can verify independently.
            </p>
          </div>
          <dl className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
            {[
              ["Encryption", "AES-256-GCM"],
              ["Transport", "TLS 1.3"],
              ["Signalling", "WebRTC · DTLS-SRTP"],
              ["Compliance", "HIPAA-aligned"],
              ["Prescriptions", "HMAC-SHA256 signed"],
              ["Audit", "Immutable log"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-paper border border-[color:var(--rule)] p-5">
                <dt className="eyebrow mb-2">{k}</dt>
                <dd className="mono text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="border-t border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1240px] px-8 py-20 text-center">
          <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] tracking-[-0.03em] max-w-[20ch] mx-auto">
            Ready when you are.{" "}
            <span className="italic-accent">No waiting room.</span>
          </h2>
          <p className="mt-5 text-ink-soft text-[16px] max-w-[52ch] mx-auto">
            Create an account in under a minute. Your first consultation can be tonight.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/register" className="btn">
              Create account
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn btn-ghost">See clinicians</Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="mt-auto border-t border-[color:var(--rule)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1240px] px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-6 w-6 rounded-md bg-clay" />
              <span className="font-display text-lg tracking-tight">Vellum<span className="italic-accent"> Health</span></span>
            </Link>
            <p className="mt-3 text-ink-mute text-[13px] leading-[1.6] max-w-[34ch]">
              Modern telemedicine — encrypted, signed, and licensed.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Patients</p>
            <ul className="space-y-1.5 text-[13.5px] text-ink-soft">
              <li><Link className="hover:text-clay" href="/register">Create account</Link></li>
              <li><Link className="hover:text-clay" href="/doctors">Find a clinician</Link></li>
              <li><Link className="hover:text-clay" href="/dashboard">Your dashboard</Link></li>
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
            <p className="eyebrow mb-3">Status</p>
            <p className="mono text-[12px] text-ink-mute leading-[1.7]">
              build · 0.1.0<br />
              status · <span className="text-moss">operational</span>
            </p>
          </div>
        </div>
        <div className="border-t border-[color:var(--rule)]">
          <div className="mx-auto w-full max-w-[1240px] px-8 py-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-mute">
            <span>© 2026 Vellum Health · all rights reserved</span>
            <span>Portfolio implementation. Not a real medical service.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
