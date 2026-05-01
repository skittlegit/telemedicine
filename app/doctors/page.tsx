import Link from "next/link";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { StarIcon } from "../_components/icons";

export const metadata = { title: "Find a doctor — Vellum Health" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ specialty?: string; q?: string }>;
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

export default async function DoctorsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  await connectDB();
  void User;

  const filter: Record<string, unknown> = {};
  if (sp.specialty) filter.specialty = sp.specialty;

  const [doctors, specialties] = await Promise.all([
    DoctorProfile.find(filter)
      .populate("user", "name status")
      .sort({ rating: -1, ratingCount: -1, createdAt: -1 })
      .limit(60)
      .lean<DoctorRow[]>(),
    DoctorProfile.distinct("specialty"),
  ]);

  const q = sp.q?.toLowerCase().trim() ?? "";
  const visible = doctors
    .filter((d) => d.user)
    .filter((d) =>
      q
        ? d.user.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          (d.languages ?? []).some((l) => l.toLowerCase().includes(q))
        : true,
    );

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader />

      {/* HERO */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-8">
        <p className="eyebrow mb-2.5">The directory</p>
        <h1 className="text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-[-0.025em] leading-[1.05] max-w-[20ch]">
          Practitioners in residence.
        </h1>
        <p className="mt-5 text-ink-soft text-[15.5px] leading-[1.65] max-w-[58ch]">
          Every clinician below is board-certified, background-checked, and has
          had their licence verified by our admin team.
        </p>

        {/* Search */}
        <form
          className="mt-7 flex flex-wrap gap-2 items-end max-w-[640px]"
          action="/doctors"
        >
          <div className="flex-1 min-w-0 w-full">
            <label className="eyebrow block mb-1.5" htmlFor="q">
              Search by name, specialty, or language
            </label>
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="e.g. Reyes, dermatology, Spanish"
              className="field"
            />
          </div>
          {sp.specialty && (
            <input type="hidden" name="specialty" value={sp.specialty} />
          )}
          <button type="submit" className="btn btn-clay">
            Search
          </button>
        </form>
      </section>

      {/* FILTER CHIPS */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 py-6 border-t border-[color:var(--rule)]">
        <p className="eyebrow mb-2.5">Filter by specialty</p>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            href={q ? `/doctors?q=${encodeURIComponent(q)}` : "/doctors"}
            label="All"
            active={!sp.specialty}
          />
          {specialties.map((s) => {
            const params = new URLSearchParams();
            params.set("specialty", s);
            if (q) params.set("q", q);
            return (
              <FilterChip
                key={s}
                href={`/doctors?${params.toString()}`}
                label={s}
                active={sp.specialty === s}
              />
            );
          })}
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-baseline justify-between mb-5">
          <p className="eyebrow">
            {visible.length} {visible.length === 1 ? "result" : "results"}
            {sp.specialty ? ` · ${sp.specialty}` : ""}
            {q ? ` · "${q}"` : ""}
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-10 text-center rounded-sm">
            <p className="text-[18px] font-semibold tracking-[-0.014em]">
              No practitioners match.
            </p>
            <p className="mt-1.5 text-ink-mute text-sm">
              Try a different specialty, or{" "}
              <Link href="/doctors" className="text-clay underline">
                clear filters
              </Link>
              .
            </p>
            <p className="mt-5 text-xs text-ink-mute">
              Are you a clinician?{" "}
              <Link
                href="/register?role=doctor"
                className="text-clay underline"
              >
                Apply for licensure review →
              </Link>
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
            {visible.map((d) => (
              <li key={d._id} className="bg-paper">
                <Link
                  href={`/doctors/${d._id}`}
                  className="group block p-5 lg:p-6 hover:bg-paper-tint transition-colors h-full"
                  prefetch
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="w-12 h-12 rounded-full bg-clay-wash text-clay text-[15px] font-semibold flex items-center justify-center"
                      aria-hidden
                    >
                      {initialsOf(d.user.name)}
                    </div>
                    {d.ratingCount > 0 ? (
                      <span className="inline-flex items-center gap-1 eyebrow">
                        <StarIcon className="w-3.5 h-3.5 text-clay" />
                        {d.rating.toFixed(1)}
                        <span className="text-ink-faint">
                          ({d.ratingCount})
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 eyebrow text-moss">
                        <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                        New
                      </span>
                    )}
                  </div>

                  <h3 className="text-[16px] mt-4 font-semibold tracking-[-0.012em] leading-[1.25]">
                    Dr. {d.user.name}
                  </h3>
                  <p className="eyebrow mt-1">
                    {d.specialty} · {d.yearsOfExperience}y exp.
                  </p>

                  {d.bio && (
                    <p className="mt-3 text-ink-soft text-[13px] leading-[1.55] line-clamp-3">
                      {d.bio}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-[color:var(--rule)] flex items-center justify-between text-[12.5px]">
                    <span className="text-ink-mute truncate">
                      {(d.languages ?? []).slice(0, 3).join(", ") || "English"}
                    </span>
                    <span className="font-semibold text-[14px]">
                      ${(d.consultationFeeCents / 100).toFixed(0)}
                    </span>
                  </div>

                  <span className="mt-3 inline-block eyebrow text-clay group-hover:translate-x-0.5 transition-transform">
                    View profile →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MarketingFooter />
    </main>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={`px-2.5 py-1 border eyebrow text-[10.5px] rounded-sm transition-colors ${
        active
          ? "bg-ink text-paper border-ink"
          : "border-[color:var(--rule-strong)] hover:bg-paper-tint"
      }`}
    >
      {label}
    </Link>
  );
}
