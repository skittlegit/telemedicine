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

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10">
        <p className="eyebrow mb-2.5">What we treat</p>
        <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] max-w-[22ch]">
          50+ specialties. One unhurried visit.
        </h1>
        <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[58ch]">
          Most clinics route everything through a single &ldquo;family doctor&rdquo;
          and refer out for the rest. We bring the specialists to you, on a
          single tab.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.name}
              href={`/specialties/${s.slug}`}
              className="bg-paper p-5 group hover:bg-paper-tint transition-colors"
              prefetch
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-clay [&>svg]:w-5 [&>svg]:h-5">{s.icon}</span>
                <span className="eyebrow text-ink-faint group-hover:text-clay transition-colors">
                  →
                </span>
              </div>
              <p className="text-[15px] font-semibold tracking-[-0.012em] leading-[1.25]">
                {s.name}
              </p>
              <p className="text-ink-mute text-[12.5px] mt-1.5 leading-[1.5]">
                {s.examples}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-12 gap-x-10 gap-y-8">
        <div className="col-span-12 lg:col-span-5">
          <p className="eyebrow mb-2.5">What we don&apos;t treat</p>
          <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
            Honesty about the limits of video.
          </h2>
          <p className="mt-5 text-ink-soft text-[14.5px] leading-[1.65] max-w-[48ch]">
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
            <div key={k} className="bg-paper p-5">
              <dt className="eyebrow mb-1.5">{k}</dt>
              <dd className="text-[13.5px] text-ink-soft leading-[1.6]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-20">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-8 sm:p-12 text-center rounded-sm">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.022em] leading-[1.2] max-w-[24ch] mx-auto">
            Find your match. In one search.
          </h2>
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
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
