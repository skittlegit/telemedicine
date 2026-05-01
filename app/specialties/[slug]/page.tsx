import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/app/_components/MarketingChrome";
import { SPECIALTIES, StarIcon } from "@/app/_components/icons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface DoctorRow {
  _id: string;
  specialty: string;
  bio: string;
  yearsOfExperience: number;
  consultationFeeCents: number;
  rating: number;
  ratingCount: number;
  languages: string[];
  user: { _id: string; name: string };
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export async function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const spec = SPECIALTIES.find((s) => s.slug === slug);
  if (!spec) return { title: "Specialty — Vellum Health" };
  return { title: `${spec.name} — Vellum Health`, description: spec.tagline };
}

export default async function SpecialtyPage({ params }: PageProps) {
  const { slug } = await params;
  const spec = SPECIALTIES.find((s) => s.slug === slug);
  if (!spec) notFound();

  await connectDB();
  void User;

  const doctors = await DoctorProfile.find({ specialty: spec.name })
    .populate("user", "name status")
    .sort({ rating: -1, ratingCount: -1, createdAt: -1 })
    .limit(12)
    .lean<DoctorRow[]>();

  const visible = doctors.filter((d) => d.user);

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader />

      {/* HERO */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-10 grid grid-cols-12 gap-x-10 gap-y-8">
        <div className="col-span-12 lg:col-span-8">
          <Link
            href="/specialties"
            className="eyebrow text-ink-mute hover:text-clay"
          >
            ← All specialties
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-clay [&>svg]:w-7 [&>svg]:h-7">
              {spec.icon}
            </span>
            <p className="eyebrow">{spec.name}</p>
          </div>
          <h1 className="mt-3 text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] max-w-[22ch]">
            {spec.tagline}
          </h1>
          <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[58ch]">
            {spec.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
              className="btn btn-clay"
              prefetch
            >
              See {spec.name.toLowerCase()} doctors{" "}
              <span aria-hidden>→</span>
            </Link>
            <Link href="/register" className="btn btn-ghost" prefetch>
              Book a consultation
            </Link>
          </div>
        </div>
      </section>

      {/* TREATS / DOESN'T */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-10 grid grid-cols-12 gap-x-10 gap-y-8">
        <div className="col-span-12 lg:col-span-6">
          <p className="eyebrow mb-3">What we treat</p>
          <ul className="border border-[color:var(--rule)] divide-y divide-[color:var(--rule)]">
            {spec.treats.map((t) => (
              <li key={t} className="px-4 py-3 flex items-start gap-3 text-[14px]">
                <span className="text-moss mt-[3px] shrink-0" aria-hidden>
                  ✓
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <p className="eyebrow mb-3">What we don&apos;t</p>
          <ul className="border border-[color:var(--rule)] divide-y divide-[color:var(--rule)]">
            {spec.doesnt.map((t) => (
              <li
                key={t}
                className="px-4 py-3 flex items-start gap-3 text-[14px] text-ink-soft"
              >
                <span className="text-amber mt-[3px] shrink-0" aria-hidden>
                  —
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
          <div className="max-w-[44ch]">
            <p className="eyebrow mb-2.5">Practitioners</p>
            <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.018em] leading-[1.2]">
              {visible.length > 0
                ? `${visible.length} ${spec.name.toLowerCase()} clinician${visible.length === 1 ? "" : "s"} available.`
                : `No ${spec.name.toLowerCase()} clinicians on the platform yet.`}
            </h2>
          </div>
          <Link
            href={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
            className="btn btn-ghost btn-sm"
          >
            View all →
          </Link>
        </div>

        {visible.length === 0 ? (
          <div className="border border-[color:var(--rule)] bg-paper-tint p-10 text-center">
            <p className="text-ink-soft text-[14px]">
              We&apos;re onboarding clinicians for this specialty. In the
              meantime, browse the full directory.
            </p>
            <Link
              href="/doctors"
              className="btn btn-clay btn-sm mt-5 inline-flex"
            >
              All doctors →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
            {visible.map((d) => (
              <Link
                key={d._id}
                href={`/doctors/${d._id}`}
                className="group bg-paper p-5 hover:bg-paper-tint transition-colors"
                prefetch
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="w-12 h-12 rounded-full bg-clay-wash text-clay text-[15px] font-semibold flex items-center justify-center"
                    aria-hidden
                  >
                    {initialsOf(d.user.name)}
                  </div>
                  {d.ratingCount > 0 && (
                    <span className="inline-flex items-center gap-1 eyebrow text-amber">
                      <StarIcon className="w-3 h-3" />
                      {d.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <h3 className="text-[16px] mt-4 font-semibold tracking-[-0.012em] leading-[1.25]">
                  Dr. {d.user.name}
                </h3>
                <p className="eyebrow mt-1">{d.specialty}</p>
                {d.bio && (
                  <p className="text-ink-soft text-[13px] mt-3 leading-[1.55] line-clamp-3">
                    {d.bio}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-[color:var(--rule)] flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-mute">
                    {d.yearsOfExperience} yrs ·{" "}
                    {(d.languages ?? []).slice(0, 2).join(", ") || "English"}
                  </span>
                  <span className="font-semibold text-[14px]">
                    ${(d.consultationFeeCents / 100).toFixed(0)}
                  </span>
                </div>
                <span className="mt-3 inline-block eyebrow text-clay group-hover:translate-x-0.5 transition-transform">
                  View profile →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-20">
        <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-8 sm:p-12 text-center">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.022em] leading-[1.2] max-w-[26ch] mx-auto">
            Ready to see a {spec.name.toLowerCase()} clinician?
          </h2>
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            <Link
              href={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
              className="btn btn-clay"
              prefetch
            >
              Find a doctor <span aria-hidden>→</span>
            </Link>
            <Link href="/specialties" className="btn btn-ghost" prefetch>
              Other specialties
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
