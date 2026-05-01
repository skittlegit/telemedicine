import Link from "next/link";
import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { PageHeader, EmptyState } from "@/app/dashboard/_components/Shell";
import { SPECIALTIES, StarIcon } from "@/app/_components/icons";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    specialty?: string;
    q?: string;
    page?: string;
    sort?: string;
  }>;
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

export default async function DashboardDoctorsPage({ searchParams }: PageProps) {
  await requireRole("patient");
  const sp = await searchParams;
  await connectDB();
  void User;

  const filter: Record<string, unknown> = {};
  if (sp.specialty) filter.specialty = sp.specialty;

  const PAGE_SIZE = 12;
  const page = Math.max(1, Number(sp.page) || 1);
  const sortKey = sp.sort ?? "rating";
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    rating: { rating: -1, ratingCount: -1, createdAt: -1 },
    experience: { yearsOfExperience: -1, rating: -1 },
    fee_asc: { consultationFeeCents: 1, rating: -1 },
    fee_desc: { consultationFeeCents: -1, rating: -1 },
  };
  const sort = sortMap[sortKey] ?? sortMap.rating;

  const q = sp.q?.toLowerCase().trim() ?? "";

  const [allMatchingForCount, doctors] = await Promise.all([
    DoctorProfile.countDocuments(filter),
    DoctorProfile.find(filter)
      .populate("user", "name status")
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<DoctorRow[]>(),
  ]);

  const visible = doctors
    .filter((d) => d.user)
    .filter((d) =>
      q
        ? d.user.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          (d.languages ?? []).some((l) => l.toLowerCase().includes(q))
        : true,
    );
  const totalPages = Math.max(1, Math.ceil(allMatchingForCount / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.specialty) params.set("specialty", sp.specialty);
    if (sp.q) params.set("q", sp.q);
    if (sortKey !== "rating") params.set("sort", sortKey);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/dashboard/doctors?${qs}` : "/dashboard/doctors";
  }

  return (
    <>
      <PageHeader eyebrow="Directory" title="Find a doctor" italic="for tonight.">
        Filter by specialty, search by name or language. Booking opens the next
        available 30-minute slot.
      </PageHeader>

      {/* Search + specialty filter */}
      <form
        method="GET"
        action="/dashboard/doctors"
        className="mb-8 flex flex-wrap gap-2 items-end"
      >
        <div className="flex-1 min-w-[220px]">
          <label htmlFor="q" className="eyebrow block mb-2">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Name, language, or condition…"
            className="field"
          />
        </div>
        <div className="min-w-[200px]">
          <label htmlFor="specialty" className="eyebrow block mb-2">
            Specialty
          </label>
          <select
            id="specialty"
            name="specialty"
            defaultValue={sp.specialty ?? ""}
            className="field"
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px]">
          <label htmlFor="sort" className="eyebrow block mb-2">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sortKey}
            className="field"
          >
            <option value="rating">Top rated</option>
            <option value="experience">Most experience</option>
            <option value="fee_asc">Lowest fee</option>
            <option value="fee_desc">Highest fee</option>
          </select>
        </div>
        <button type="submit" className="btn btn-clay btn-sm">
          Search →
        </button>
        {(q || sp.specialty || sortKey !== "rating") && (
          <Link href="/dashboard/doctors" className="btn btn-ghost btn-sm">
            Clear
          </Link>
        )}
      </form>

      {/* Specialty chips */}
      <div className="mb-8 flex flex-wrap gap-1.5">
        {SPECIALTIES.map((s) => {
          const active = sp.specialty === s.name;
          return (
            <Link
              key={s.name}
              href={
                active
                  ? "/dashboard/doctors"
                  : `/dashboard/doctors?specialty=${encodeURIComponent(s.name)}`
              }
              className={`px-2.5 py-1 border eyebrow rounded-sm transition-colors ${
                active
                  ? "border-clay bg-clay-wash text-clay"
                  : "border-[color:var(--rule-strong)] text-ink hover:border-clay hover:text-clay"
              }`}
            >
              {s.name}
            </Link>
          );
        })}
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <EmptyState
          message={
            sp.specialty || q
              ? "No clinicians match that filter."
              : "No clinicians on the platform yet."
          }
          cta={
            <Link href="/dashboard/doctors" className="btn btn-ghost text-xs">
              Clear filters
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {visible.map((d) => (
            <Link
              key={d._id}
              href={`/dashboard/doctors/${d._id}`}
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
                  {formatINR(d.consultationFeeCents)}
                </span>
              </div>
              <span className="mt-3 inline-block eyebrow text-clay group-hover:translate-x-0.5 transition-transform">
                View & book →
              </span>
            </Link>
          ))}
        </div>
      )}

      {visible.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-between border-t border-[color:var(--rule)] pt-4 text-[13px]"
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn btn-ghost btn-sm">
              ← Previous
            </Link>
          ) : (
            <span aria-hidden />
          )}
          <span className="eyebrow text-ink-mute">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="btn btn-ghost btn-sm">
              Next →
            </Link>
          ) : (
            <span aria-hidden />
          )}
        </nav>
      )}
    </>
  );
}
