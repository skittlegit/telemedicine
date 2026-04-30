import Link from "next/link";

/**
 * Landing page — set as a fictional medical journal "masthead".
 * Clinical Editorial aesthetic. No purple gradients. No cookie-cutter SaaS hero.
 */
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      {/* ============ MASTHEAD ============ */}
      <header className="border-b border-[color:var(--rule-strong)]">
        <div className="mx-auto w-full max-w-[1320px] px-8 pt-6 pb-3 flex items-baseline justify-between gap-6">
          <span className="eyebrow">Vol. I &nbsp;·&nbsp; Issue I &nbsp;·&nbsp; Est. MMXXVI</span>
          <span className="eyebrow hidden md:inline">A licensed practice of remote medicine</span>
          <span className="eyebrow tabular-nums">№ 0001</span>
        </div>
        <div className="mx-auto w-full max-w-[1320px] px-8 pb-6">
          <h1 className="font-display text-[clamp(3.5rem,11vw,11rem)] leading-[0.85] tracking-[-0.04em] rise rise-1">
            Vellum<span className="italic-accent"> Health</span>
          </h1>
        </div>
        <div className="mx-auto w-full max-w-[1320px] px-8 pb-3 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--rule)] pt-3">
          <span className="eyebrow">A periodical of remote consultation</span>
          <nav className="flex gap-7 eyebrow">
            <Link href="/doctors" className="hover:text-clay transition-colors">Practitioners</Link>
            <Link href="/login" className="hover:text-clay transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-clay transition-colors">Register</Link>
          </nav>
        </div>
      </header>

      {/* ============ LEDE ============ */}
      <section className="mx-auto w-full max-w-[1320px] px-8 pt-16 pb-20 grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-7 rise rise-2">
          <p className="eyebrow mb-6">§ I &nbsp; The proposition</p>
          <p className="font-display text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.05] tracking-[-0.02em] text-ink">
            A clinic without a waiting room.{" "}
            <span className="italic-accent">A pharmacy without a queue.</span>{" "}
            A record that <span className="italic-accent">remembers you</span>—and is read by no
            one else.
          </p>
          <p className="mt-8 max-w-[44ch] text-ink-soft text-[17px] leading-[1.55]">
            Vellum Health is a closed circuit between you and licensed clinicians. Book a
            thirty-minute consultation, meet over encrypted video, receive a digital prescription
            authenticated by signature and cipher, and—if you choose—have it filled by a verified
            pharmacist within the hour.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 rise rise-3">
            <Link href="/register" className="btn btn-clay">
              Begin a consultation
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn btn-ghost">
              Read the directory
            </Link>
          </div>
        </div>

        {/* Editorial side-column: clinical notes */}
        <aside className="col-span-12 md:col-span-5 md:pl-8 md:border-l md:border-[color:var(--rule)] rise rise-3">
          <p className="eyebrow mb-4">Editor’s note</p>
          <p className="text-[15px] leading-[1.7] text-ink-soft">
            Most telemedicine reads like a pharmaceutical advertisement. We have set ours in a
            serif, in the tradition of <em>The Lancet</em> and <em>The New England Journal</em>—on
            the conviction that gravity, in matters of one’s own body, is a feature.
          </p>
          <hr className="rule my-6" />
          <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-[13px]">
            <dt className="eyebrow">Encryption</dt>
            <dd className="mono">AES-256-GCM</dd>
            <dt className="eyebrow">Signalling</dt>
            <dd className="mono">WebRTC · DTLS-SRTP</dd>
            <dt className="eyebrow">Compliance</dt>
            <dd className="mono">HIPAA-aligned</dd>
            <dt className="eyebrow">Audit</dt>
            <dd className="mono">Immutable log</dd>
          </dl>
        </aside>
      </section>

      <hr className="rule mx-8" />

      {/* ============ TABLE OF CONTENTS ============ */}
      <section className="mx-auto w-full max-w-[1320px] px-8 py-20">
        <div className="flex items-baseline justify-between mb-12 rise rise-3">
          <p className="eyebrow">§ II &nbsp; Contents of the practice</p>
          <p className="eyebrow tabular-nums">06 / 06</p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
          {[
            { n: "01", title: "Consultation", italic: "by appointment", body: "Thirty-minute encrypted video sessions with the practitioner of your choice." },
            { n: "02", title: "Prescription", italic: "issued in cipher", body: "Digitally signed, HMAC-verified, scannable by any participating pharmacist." },
            { n: "03", title: "Pharmacy", italic: "filled the same day", body: "Direct-to-door dispatch from a verified pharmacist queue, payment in escrow." },
            { n: "04", title: "Records", italic: "kept in confidence", body: "Field-level encryption of every clinical note, allergen, history, and address." },
            { n: "05", title: "Insurance", italic: "claim-ready", body: "Itemised invoices in CMS-1500 form, with ICD-10 coding and policy attachment." },
            { n: "06", title: "Audit", italic: "without amnesia", body: "Every action against your record is timestamped, attributed, and unforgeable." },
          ].map((item, i) => (
            <li
              key={item.n}
              className={`group grid grid-cols-[3.5rem_1fr] gap-x-5 py-6 border-t border-[color:var(--rule)] ${i === 5 ? "border-b" : ""} rise`}
              style={{ animationDelay: `${300 + i * 80}ms` }}
            >
              <span className="mono text-ink-mute text-[14px] pt-1 tabular-nums">{item.n}</span>
              <div>
                <h3 className="font-display text-[2rem] leading-[1] tracking-[-0.02em]">
                  {item.title}{" "}
                  <span className="italic-accent text-[1.4rem]">{item.italic}</span>
                </h3>
                <p className="mt-3 max-w-[42ch] text-ink-soft text-[14.5px] leading-[1.55]">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ COLOPHON ============ */}
      <footer className="mt-auto border-t border-[color:var(--rule-strong)]">
        <div className="mx-auto w-full max-w-[1320px] px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="eyebrow mb-3">Colophon</p>
            <p className="text-ink-soft text-[13.5px] leading-[1.65] max-w-[34ch]">
              Set in <span className="italic-accent not-italic">Fraunces</span> and{" "}
              <em>IBM Plex</em>. Printed for the screen, on warm paper, in MMXXVI.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Patients</p>
            <ul className="space-y-1.5 text-[13.5px]">
              <li><Link className="hover:text-clay" href="/register">Register</Link></li>
              <li><Link className="hover:text-clay" href="/doctors">Find a clinician</Link></li>
              <li><Link className="hover:text-clay" href="/dashboard">Patient ledger</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Clinicians</p>
            <ul className="space-y-1.5 text-[13.5px]">
              <li><Link className="hover:text-clay" href="/login">Practitioner sign-in</Link></li>
              <li><Link className="hover:text-clay" href="/register?role=doctor">Apply for licensure review</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">In the foundry</p>
            <p className="mono text-[12px] text-ink-mute leading-[1.7]">
              build · 0.1.0<br />
              region · localhost<br />
              status · <span className="text-moss">operational</span>
            </p>
          </div>
        </div>
        <div className="border-t border-[color:var(--rule)]">
          <div className="mx-auto w-full max-w-[1320px] px-8 py-4 flex flex-wrap items-center justify-between gap-3 eyebrow">
            <span>© MMXXVI Vellum Health · all rights reserved</span>
            <span>This site is a portfolio implementation. Not a real medical service.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
