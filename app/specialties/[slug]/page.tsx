import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import { SPECIALTIES } from "@/app/_components/icons";

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

export async function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const spec = SPECIALTIES.find((s) => s.slug === slug);
  if (!spec) return { title: "Specialty · Vellum Health" };
  return { title: `${spec.name} · Vellum Health`, description: spec.tagline };
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
  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>Specialties · {spec.name}</span>
          <span className="meta">{visible.length} on call</span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-6">
        <Link href="/specialties" className="btn-link">
          <span aria-hidden>←</span> All specialties
        </Link>
      </section>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-14 grid grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-12 lg:col-span-9">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-clay [&>svg]:w-6 [&>svg]:h-6">{spec.icon}</span>
            <p className="eyebrow">{spec.name}</p>
          </div>
          <h1 className="serif-display mt-3 text-[clamp(2.5rem,7vw,5.75rem)] max-w-[18ch]">
            {spec.tagline.replace(/\.$/, "")}
            <span className="italic-accent">.</span>
          </h1>
          <p className="mt-7 max-w-[58ch] text-[16px] leading-[1.7] text-ink-soft">
            {spec.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
              className="btn btn-clay btn-lg"
              prefetch
            >
              See {spec.name.toLowerCase()} clinicians <span aria-hidden>→</span>
            </Link>
            <Link href="/register" className="btn-link">
              Book a consultation <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <aside className="col-span-12 lg:col-span-3 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>Front matter</strong>
            This page is the desk&apos;s front matter, in the editorial
            sense: a description of what it treats, what it cannot, and
            who is currently on call.
          </p>
        </aside>
      </section>

      {/* Treats / doesn't */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-14 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-6">
            <p className="eyebrow">What this desk treats</p>
            <ul className="mt-4 border-t border-[color:var(--rule)]">
              {spec.treats.map((t) => (
                <li
                  key={t}
                  className="grid grid-cols-12 gap-3 py-3.5 border-b border-[color:var(--rule)] text-[14.5px]"
                >
                  <span
                    aria-hidden
                    className="col-span-1 mono text-moss text-[14px] tabular pt-0.5"
                  >
                    ✓
                  </span>
                  <span className="col-span-11 text-ink-soft leading-[1.55]">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <p className="eyebrow">What it does not</p>
            <ul className="mt-4 border-t border-[color:var(--rule)]">
              {spec.doesnt.map((t) => (
                <li
                  key={t}
                  className="grid grid-cols-12 gap-3 py-3.5 border-b border-[color:var(--rule)] text-[14.5px]"
                >
                  <span
                    aria-hidden
                    className="col-span-1 mono text-amber text-[14px] tabular pt-0.5"
                  >
                    —
                  </span>
                  <span className="col-span-11 text-ink-mute leading-[1.55]">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Practitioners */}
      <section className="border-t border-[color:var(--rule-strong)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-16 sm:py-20">
          <div className="masthead mb-8">
            <span>On call · {spec.name}</span>
            <span className="meta">{visible.length} practitioners</span>
          </div>

          {visible.length === 0 ? (
            <div className="border-y border-[color:var(--rule-strong)] py-14 text-center">
              <p className="serif-section text-[1.5rem]">
                No practitioners on this desk yet.
              </p>
              <p className="mt-3 text-ink-mute text-[14px]">
                We are onboarding clinicians for {spec.name.toLowerCase()}.
                In the meantime, the full directory is open.
              </p>
              <Link href="/doctors" className="btn btn-clay btn-lg mt-6 inline-flex">
                All doctors <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            <ol>
              {visible.map((d, i) => (
                <li
                  key={d._id}
                  className="border-t border-[color:var(--rule)] last:border-b last:border-[color:var(--rule)]"
                >
                  <Link
                    href={`/doctors/${d._id}`}
                    prefetch
                    className="group grid grid-cols-12 gap-x-4 gap-y-2 py-5 sm:py-6 hover:bg-paper transition-colors px-1"
                  >
                    <span className="col-span-2 sm:col-span-1 mono text-ink-mute text-[12px] tabular pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="col-span-10 sm:col-span-6">
                      <p className="serif-section text-[clamp(1.05rem,2vw,1.4rem)] text-ink group-hover:text-clay transition-colors">
                        Dr. {d.user.name}
                      </p>
                      <p className="mono text-ink-mute text-[11px] tracking-[0.14em] uppercase mt-1.5">
                        {d.yearsOfExperience}y experience ·{" "}
                        {(d.languages ?? []).slice(0, 2).join(", ") || "English"}
                      </p>
                    </div>
                    <div className="col-span-12 sm:col-span-4 text-[12.5px] text-ink-mute leading-[1.55] sm:pt-1">
                      {d.bio && (
                        <p className="line-clamp-2 text-ink-soft text-[13.5px]">
                          {d.bio}
                        </p>
                      )}
                      {d.ratingCount > 0 && (
                        <p className="mt-2 mono text-[11px] text-ink-mute tabular">
                          ★ {d.rating.toFixed(1)} · {d.ratingCount} reviews
                        </p>
                      )}
                    </div>
                    <div className="col-span-12 sm:col-span-1 sm:text-right sm:pt-1">
                      <p className="serif-section text-[1.1rem] text-ink tabular">
                        {formatINR(d.consultationFeeCents)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
