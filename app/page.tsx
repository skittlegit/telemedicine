import Link from "next/link";
import { redirect } from "next/navigation";
import { MarketingHeader, MarketingFooter } from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import { getSession } from "@/lib/authz";
import { SPECIALTIES, ShieldIcon } from "@/app/_components/icons";

/**
 * Vellum Health landing page — editorial-clinical register.
 *
 * The structural devices on this page are the brand signature, used
 * deliberately and no more than once each:
 *   - one display headline with one italic-accent fragment (.italic-accent)
 *   - one masthead block at the top of the editorial column
 *   - one bill-of-fare price strip
 *   - one numbered feature run (01 / 02 / 03)
 *   - one editorial-prose paragraph with .dropcap
 *
 * Logged-in users are redirected to /dashboard.
 */
export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");
  const headerProps = await marketingHeaderProps();

  const issue = currentIssue();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      {/* ============ MASTHEAD ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-6">
        <div className="masthead">
          <span>
            <span>Vellum Health</span>
            <span className="meta hidden sm:inline">Edition {issue.edition}</span>
          </span>
          <span className="meta">
            {issue.dateLine}
            <span className="hidden md:inline"> · No.{issue.no}</span>
          </span>
        </div>
      </section>

      {/* ============ HERO ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10 sm:pt-14 lg:pt-20 pb-12 sm:pb-16 grid grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <p className="eyebrow">Tonight, in India / still open</p>

          <h1 className="serif-display mt-5 text-[clamp(3.25rem,12vw,9.5rem)]">
            A real doctor,{" "}
            <span className="italic-accent">tonight.</span>
          </h1>

          <p className="mt-7 max-w-[58ch] text-[16.5px] leading-[1.65] text-ink-soft">
            Vellum Health is a flat-fee, video-first telemedicine clinic.
            Book a thirty-minute consultation with a board-certified
            physician, receive a digitally signed prescription, and have
            it filled at a verified pharmacy the same day. No insurance.
            No waiting room.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn btn-clay btn-lg">
              Register
              <span aria-hidden>→</span>
            </Link>
            <Link href="/doctors" className="btn-link">
              Browse the practice
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 xl:col-span-3 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="relative inline-flex">
              <span className="absolute inset-0 rounded-full bg-moss/40 animate-ping" aria-hidden />
              <span className="relative h-2 w-2 rounded-full bg-moss" aria-hidden />
            </span>
            <span className="eyebrow text-ink">14 clinicians on call</span>
          </div>

          <p className="sidenote">
            <strong>Edition note</strong>
            Filed nightly from a clinic of fourteen board-certified
            physicians and four registered pharmacists. Vellum operates
            from {issue.opens} to {issue.closes}, every night of the year.
          </p>

          <div className="mt-7">
            <span className="stamp">
              <ShieldIcon className="w-3 h-3" />
              Flat fee · ₹499
            </span>
          </div>
        </aside>
      </section>

      {/* ============ BILL OF FARE ============ */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pb-16 sm:pb-20">
        <div className="grid grid-cols-12 gap-x-8 gap-y-6">
          <div className="col-span-12 md:col-span-4">
            <p className="eyebrow">Bill of fare</p>
            <h2 className="serif-section mt-3 text-[clamp(1.75rem,4vw,2.6rem)]">
              What is{" "}
              <span className="italic-accent">included.</span>
            </h2>
            <p className="mt-4 max-w-[36ch] text-[14px] leading-[1.65] text-ink-soft">
              No upsells. No surprise add-ons at checkout. The fee covers
              everything between booking and the prescription clearing
              your pharmacist.
            </p>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <div role="list">
              {BILL.map((row) => (
                <div key={row.label} className="bill" role="listitem">
                  <span className="label">{row.label}</span>
                  <span className="leader" aria-hidden />
                  <span className="price tabular">{row.price}</span>
                </div>
              ))}
              <div className="bill" role="listitem" style={{ borderBottom: "1px solid var(--rule)" }}>
                <span className="label" style={{ fontWeight: 600 }}>
                  Total, per visit
                </span>
                <span className="leader" aria-hidden />
                <span className="price tabular" style={{ fontSize: "1.25rem" }}>
                  ₹499
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NUMBERED FEATURES ============ */}
      <section id="how" className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <div className="masthead mb-12 sm:mb-16">
            <span>How it runs</span>
            <span className="meta">
              <span className="hidden sm:inline">Three steps</span>
              <span>· §02</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-14">
            {FEATURES.map((feat, i) => (
              <article key={feat.head} className="grid grid-cols-12 gap-x-4">
                <div className="col-span-2 md:col-span-12">
                  <span className="numbered block">{`0${i + 1}`}</span>
                  <hr className="rule mt-3 mb-5 hidden md:block" />
                </div>
                <div className="col-span-10 md:col-span-12">
                  <h3 className="serif-section text-[clamp(1.4rem,2.6vw,1.85rem)]">
                    {feat.head}{" "}
                    <span className="italic-accent">{feat.italic}</span>
                  </h3>
                  <p className="mt-4 max-w-[34ch] text-[14.5px] leading-[1.65] text-ink-soft">
                    {feat.body}
                  </p>
                  <p className="mt-4 sidenote">
                    <strong>Filed under</strong>
                    {feat.filed}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SPECIALTIES INDEX ============ */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <div className="masthead mb-10">
            <span>The index</span>
            <span className="meta">
              <span className="hidden sm:inline">Specialties on file</span>
              <span> · §03</span>
            </span>
          </div>

          <div className="grid grid-cols-12 gap-x-8 gap-y-10">
            <div className="col-span-12 lg:col-span-4">
              <h2 className="serif-section text-[clamp(1.85rem,4vw,2.85rem)] max-w-[18ch]">
                Eight desks,{" "}
                <span className="italic-accent">fifty subjects.</span>
              </h2>
              <p className="mt-5 max-w-[36ch] text-[14.5px] leading-[1.65] text-ink-soft">
                The practice is organised the way a teaching hospital is:
                one clinician in charge per specialty, with the rest of
                the bench rotating on call. Every desk takes its own
                kind of question.
              </p>
              <Link href="/doctors" className="btn-link mt-6">
                See all clinicians
                <span aria-hidden>→</span>
              </Link>
            </div>

            <ol className="col-span-12 lg:col-span-8">
              {SPECIALTIES.map((s, i) => (
                <li
                  key={s.slug}
                  className="grid grid-cols-12 gap-4 items-baseline border-t border-[color:var(--rule)] py-5 group"
                >
                  <span className="col-span-2 sm:col-span-1 mono text-ink-mute text-[12px] tabular pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/specialties/${s.slug}`}
                    className="col-span-10 sm:col-span-5 serif-section text-[clamp(1.05rem,2.4vw,1.45rem)] text-ink hover:text-clay transition-colors"
                  >
                    {s.name}
                  </Link>
                  <span className="col-span-12 sm:col-span-5 text-[13px] text-ink-soft leading-snug pt-0.5">
                    {s.examples}
                  </span>
                  <span
                    aria-hidden
                    className="col-span-12 sm:col-span-1 text-right mono text-ink-faint group-hover:text-clay transition-colors text-[14px]"
                  >
                    →
                  </span>
                </li>
              ))}
              <li className="border-t border-[color:var(--rule-strong)]" />
            </ol>
          </div>
        </div>
      </section>

      {/* ============ ON DISPENSING — pharmacy ============ */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="eyebrow">On dispensing</p>
            <h2 className="serif-section mt-3 text-[clamp(1.85rem,4.5vw,3rem)] max-w-[20ch]">
              Signed scripts, fulfilled{" "}
              <span className="italic-accent">by hand.</span>
            </h2>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.65] text-ink-soft">
              Every prescription carries an HMAC-SHA256 signature. A
              partner pharmacist verifies it, claims the script
              within minutes, and delivers same-day on metro routes.
              No fax, no forgery, no insurance theatre.
            </p>
            <Link href="/pharmacy" className="btn-link mt-7">
              Read the dispensing note
              <span aria-hidden>→</span>
            </Link>
          </div>

          <dl className="col-span-12 lg:col-span-7 self-start">
            {RECORDS.map(([k, v, note], i) => (
              <div
                key={k}
                className={
                  "grid grid-cols-12 gap-4 py-4 " +
                  (i === 0 ? "border-t border-b border-[color:var(--rule)]" : "border-b border-[color:var(--rule)]")
                }
              >
                <dt className="col-span-12 sm:col-span-4 eyebrow text-ink">
                  {k}
                </dt>
                <dd className="col-span-12 sm:col-span-4 mono text-ink text-[13.5px] tabular">
                  {v}
                </dd>
                <dd className="col-span-12 sm:col-span-4 text-[12.5px] text-ink-mute leading-[1.55]">
                  {note}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ COLOPHON / FINAL CTA ============ */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-28">
          <div className="grid grid-cols-12 gap-x-8 gap-y-10">
            <div className="col-span-12 lg:col-span-8">
              <p className="eyebrow">Colophon</p>
              <h2 className="serif-display mt-4 text-[clamp(2.5rem,9vw,7rem)]">
                Care, today.{" "}
                <span className="italic-accent block sm:inline">
                  No waiting room.
                </span>
              </h2>
              <p className="mt-7 max-w-[48ch] text-[15.5px] leading-[1.65] text-ink-soft">
                Registration takes under a minute. Your first visit can
                be tonight.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn btn-clay btn-lg">
                  Create your account
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/how-it-works" className="btn-link">
                  How a visit runs
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-[color:var(--rule)]">
              <p className="sidenote">
                <strong>Set in</strong>
                Fraunces, IBM Plex Sans, JetBrains Mono. On warm bone
                paper, ink in deep aubergine. Hairlines at one-tenth.
              </p>
              <p className="sidenote mt-6">
                <strong>Compliance</strong>
                HIPAA-aligned operations · TLS 1.3 in transit ·
                AES-256-GCM at rest · HMAC-SHA256 prescription
                signatures · immutable audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}

/* ====================================================================
   Static content
   ==================================================================== */

const BILL: Array<{ label: string; price: string }> = [
  { label: "Booking and a thirty-minute consultation", price: "₹499" },
  { label: "Digital prescription, signed and verifiable", price: "incl." },
  { label: "Encrypted record of the visit, kept private", price: "incl." },
  { label: "Pharmacy fulfilment routed near you", price: "at cost" },
  { label: "Cancel or reschedule, until the slot opens", price: "free" },
];

const FEATURES: Array<{
  head: string;
  italic: string;
  body: string;
  filed: string;
}> = [
  {
    head: "Book a slot,",
    italic: "in under a minute.",
    body:
      "Pick a clinician by specialty, language, or the next open slot. Pay the flat fee and the room is yours, opening on the hour. No insurance check, no pre-screening questionnaire.",
    filed: "Booking · /book/[doctor]",
  },
  {
    head: "Speak to a clinician,",
    italic: "by encrypted video.",
    body:
      "Thirty minutes, one-on-one, on a HIPAA-aligned WebRTC channel. Photos and lab notes can be shared inside the consult. The clinician writes the script while you watch.",
    filed: "Consult · /consult/[appointment]",
  },
  {
    head: "Have it filled,",
    italic: "the same day.",
    body:
      "Prescriptions carry an HMAC signature any pharmacist can verify against our public ledger. We route them to a partner pharmacy for pickup or delivery within hours.",
    filed: "Pharmacy · /pharmacy/order",
  },
];

const RECORDS: ReadonlyArray<readonly [string, string, string]> = [
  ["Network", "42 partner pharmacies", "Independent dispensaries across nine metros, vetted quarterly."],
  ["Verification", "HMAC-SHA256", "Pharmacists verify each script independently of Vellum."],
  ["Same-day, metro", "₹49 standard", "Signature on receipt where the schedule requires it."],
  ["Cold chain", "2–8°C maintained", "Validated containers for refrigerated medications."],
  ["Refusal rate", "0.04% YTD", "Forgeries and tampered signatures, refused on verification."],
  ["Audit trail", "Immutable ledger", "Every claim, dispense, and delivery, append-only."],
];

/**
 * Build a stable issue line for the masthead. Edition increments by month
 * since launch; date line is the current month/year. No live data needed.
 */
function currentIssue() {
  const now = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  // Roman numeral edition, soft monthly cadence from Jan 2025
  const launch = new Date(2025, 0, 1);
  const monthsSince =
    (now.getFullYear() - launch.getFullYear()) * 12 +
    (now.getMonth() - launch.getMonth()) +
    1;
  return {
    edition: toRoman(monthsSince),
    no: String(now.getDate()).padStart(2, "0"),
    dateLine: `${month}. ${year}`,
    opens: "07:00 PM",
    closes: "02:00 AM",
  };
}

function toRoman(n: number): string {
  const map: Array<[number, string]> = [
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"],
    [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let v = n;
  for (const [num, sym] of map) {
    while (v >= num) {
      out += sym;
      v -= num;
    }
  }
  return out || "I";
}
