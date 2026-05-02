import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";
import { SPECIALTIES } from "../_components/icons";

export const metadata = { title: "Specialties · Vellum Health" };

const NOT_TREATED: ReadonlyArray<{ k: string; v: string }> = [
  { k: "Emergencies", v: "Call 112 or your local emergency number, immediately." },
  { k: "Schedule II controls", v: "Federal law requires an in-person visit." },
  { k: "Imaging and laboratory", v: "We refer; you attend a partner facility." },
  { k: "Surgery and procedures", v: "We refer to a local specialist." },
];

export default async function SpecialtiesPage() {
  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>Specialties on file</span>
          <span className="meta">{SPECIALTIES.length} desks · 50+ subjects</span>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-12 sm:pt-14 pb-12 grid grid-cols-12 gap-x-8 gap-y-8">
        <div className="col-span-12 lg:col-span-9">
          <p className="eyebrow">What we treat</p>
          <h1 className="serif-display mt-5 text-[clamp(2.5rem,7.5vw,6rem)]">
            Eight desks,{" "}
            <span className="italic-accent">fifty subjects.</span>
          </h1>
          <p className="mt-7 max-w-[58ch] text-[16px] leading-[1.65] text-ink-soft">
            Most clinics run every question through a single family doctor
            and refer out for the rest. We organise the practice the way
            a teaching hospital does, with a clinician in charge of each
            desk and the bench rotating on call.
          </p>
        </div>
        <aside className="col-span-12 lg:col-span-3 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>Reading the index</strong>
            Each entry below opens a front-matter page describing what
            the desk treats, when video works, and when it does not.
          </p>
        </aside>
      </section>

      {/* Index */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-14">
          <ol>
            {SPECIALTIES.map((s, i) => (
              <li
                key={s.slug}
                className="border-t border-[color:var(--rule)] last:border-b last:border-[color:var(--rule)]"
              >
                <Link
                  href={`/specialties/${s.slug}`}
                  prefetch
                  className="group grid grid-cols-12 gap-x-4 gap-y-2 py-6 sm:py-7 hover:bg-paper-tint transition-colors px-1"
                >
                  <span className="col-span-2 sm:col-span-1 mono text-ink-mute text-[12px] tabular pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="col-span-10 sm:col-span-4">
                    <span className="text-clay block mb-2 [&>svg]:w-5 [&>svg]:h-5">
                      {s.icon}
                    </span>
                    <h2 className="serif-section text-[clamp(1.15rem,2.4vw,1.55rem)] text-ink group-hover:text-clay transition-colors">
                      {s.name}
                    </h2>
                  </div>
                  <p className="col-span-12 sm:col-span-6 text-[14px] text-ink-soft leading-[1.6] sm:pt-1">
                    {s.tagline}
                    <span className="block mono text-[11px] tracking-[0.14em] uppercase text-ink-mute mt-2">
                      {s.examples}
                    </span>
                  </p>
                  <span
                    aria-hidden
                    className="col-span-12 sm:col-span-1 sm:text-right mono text-ink-faint group-hover:text-clay transition-colors text-[14px] sm:pt-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we don't treat */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="eyebrow">Limits of video</p>
            <h2 className="serif-section mt-3 text-[clamp(1.85rem,4.5vw,2.85rem)] max-w-[20ch]">
              Honesty about{" "}
              <span className="italic-accent">what video cannot do.</span>
            </h2>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.65] text-ink-soft">
              Telemedicine is a powerful instrument, but it is not the
              right instrument for every question. If your case requires
              hands or hardware, the clinician will say so, and your
              consultation fee is refunded.
            </p>
          </div>
          <dl className="col-span-12 lg:col-span-7">
            {NOT_TREATED.map(({ k, v }, i) => (
              <div
                key={k}
                className={
                  "grid grid-cols-12 gap-4 py-5 " +
                  (i === 0 ? "border-t border-b border-[color:var(--rule)]" : "border-b border-[color:var(--rule)]")
                }
              >
                <dt className="col-span-12 sm:col-span-4 eyebrow text-ink">
                  {k}
                </dt>
                <dd className="col-span-12 sm:col-span-8 text-[14px] text-ink-soft leading-[1.6]">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-24">
          <h2 className="serif-display text-[clamp(2.25rem,7vw,5rem)] max-w-[20ch]">
            Find your match.{" "}
            <span className="italic-accent">In one search.</span>
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/doctors" className="btn btn-clay btn-lg">
              Browse the directory
              <span aria-hidden>→</span>
            </Link>
            <Link href="/how-it-works" className="btn-link">
              How a visit runs
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
