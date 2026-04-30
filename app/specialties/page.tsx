import Link from "next/link";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { SPECIALTIES } from "../_components/icons";

export const metadata = { title: "Specialties — Vellum Health" };

export default function SpecialtiesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-24 pb-12">
        <p className="eyebrow mb-3">What we treat</p>
        <h1 className="font-display text-[clamp(2rem,8vw,6rem)] leading-[0.98] tracking-[-0.035em] max-w-[20ch] break-words">
          50+ specialties.{" "}
          <span className="italic-accent">One unhurried visit.</span>
        </h1>
        <p className="mt-7 text-ink-soft text-[17px] leading-[1.65] max-w-[58ch]">
          Most clinics route everything through a single &ldquo;family doctor&rdquo;
          and refer out for the rest. We bring the specialists to you, on a
          single tab.
        </p>
      </section>

      <hr className="rule mx-5 sm:mx-6 lg:mx-8" />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.name}
              href={`/doctors?specialty=${encodeURIComponent(s.name)}`}
              className="bg-paper p-6 group hover:bg-paper-tint transition-colors"
              prefetch
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-clay [&>svg]:w-6 [&>svg]:h-6">{s.icon}</span>
                <span className="eyebrow text-ink-faint group-hover:text-clay transition-colors">
                  →
                </span>
              </div>
              <p className="font-display text-[1.35rem] tracking-[-0.02em] leading-[1.05]">
                {s.name}
              </p>
              <p className="text-ink-mute text-[12.5px] mt-2 leading-[1.5]">
                {s.examples}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <hr className="rule mx-5 sm:mx-6 lg:mx-8" />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-3">What we don&apos;t treat</p>
          <h2 className="font-display text-[clamp(1.6rem,5vw,3.25rem)] tracking-[-0.025em] leading-[1.04] break-words">
            Honesty about the{" "}
            <span className="italic-accent">limits of video.</span>
          </h2>
          <p className="mt-6 text-ink-soft text-[15.5px] leading-[1.65] max-w-[48ch]">
            Telemedicine is a powerful tool — but it isn&apos;t the right tool
            for everything. If your case requires hands or hardware, we&apos;ll
            tell you, and refund the visit fee.
          </p>
        </div>
        <dl className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)] self-start">
          {[
            ["Emergencies", "Call 911 or your local emergency number."],
            ["Schedule II controls", "Federal law requires in-person."],
            ["Imaging & labs", "We refer; you visit a partner."],
            ["Surgery & procedures", "We refer to local specialists."],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-6">
              <dt className="eyebrow mb-2">{k}</dt>
              <dd className="text-[14px] text-ink-soft leading-[1.6]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pb-24">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-7 sm:p-10 lg:p-14 text-center">
          <h2 className="font-display text-[clamp(1.85rem,6vw,3.5rem)] tracking-[-0.03em] leading-[1.02] max-w-[22ch] mx-auto break-words">
            Find your match.{" "}
            <span className="italic-accent">In one search.</span>
          </h2>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link href="/doctors" className="btn btn-clay" prefetch>
              Browse all doctors <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
