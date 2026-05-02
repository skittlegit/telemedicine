import Link from "next/link";
import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import {
  MarketingHeader,
  MarketingFooter,
} from "../_components/MarketingChrome";
import { marketingHeaderProps } from "../_components/marketingHeaderProps";

export const metadata = { title: "The directory · Vellum Health" };
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

export default async function DoctorsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  await connectDB();
  void User;

  const filter: Record<string, unknown> = {};
  if (sp.specialty) filter.specialty = sp.specialty;

  const PAGE_SIZE = 16;
  const page = Math.max(1, Number(sp.page) || 1);
  const sortKey = sp.sort ?? "rating";
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    rating: { rating: -1, ratingCount: -1, createdAt: -1 },
    experience: { yearsOfExperience: -1, rating: -1 },
    fee_asc: { consultationFeeCents: 1, rating: -1 },
    fee_desc: { consultationFeeCents: -1, rating: -1 },
  };
  const sort = sortMap[sortKey] ?? sortMap.rating;

  const [doctors, specialties, totalCount] = await Promise.all([
    DoctorProfile.find(filter)
      .populate("user", "name status")
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<DoctorRow[]>(),
    DoctorProfile.distinct("specialty"),
    DoctorProfile.countDocuments(filter),
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
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.specialty) params.set("specialty", sp.specialty);
    if (sp.q) params.set("q", sp.q);
    if (sortKey !== "rating") params.set("sort", sortKey);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/doctors?${qs}` : "/doctors";
  }

  function sortHref(key: string) {
    const params = new URLSearchParams();
    if (sp.specialty) params.set("specialty", sp.specialty);
    if (sp.q) params.set("q", sp.q);
    if (key !== "rating") params.set("sort", key);
    const qs = params.toString();
    return qs ? `/doctors?${qs}` : "/doctors";
  }

  const headerProps = await marketingHeaderProps();

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>The directory</span>
          <span className="meta">
            {totalCount} clinicians on file
            {sp.specialty ? ` · ${sp.specialty}` : ""}
          </span>
        </div>
      </section>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-12 sm:pt-14 pb-10 grid grid-cols-12 gap-x-8 gap-y-8">
        <div className="col-span-12 lg:col-span-9">
          <p className="eyebrow">Practitioners in residence</p>
          <h1 className="serif-display mt-5 text-[clamp(2.5rem,7vw,5.75rem)]">
            Every clinician,{" "}
            <span className="italic-accent">named.</span>
          </h1>
          <p className="mt-7 max-w-[58ch] text-[16px] leading-[1.65] text-ink-soft">
            Each entry below has been licence-verified, background-checked,
            and read by our admissions panel. The list is alphabetical
            within sort order; you may filter by specialty or search by
            name, language, or condition.
          </p>
        </div>
        <aside className="col-span-12 lg:col-span-3 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="sidenote">
            <strong>On admission</strong>
            We do not list every applicant. Admission is by panel review.
            New entries are marked <em>new</em> until they have completed
            ten consultations on the platform.
          </p>
        </aside>
      </section>

      {/* Search + filter strip */}
      <section className="border-y border-[color:var(--rule)] bg-paper-tint">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-6 grid grid-cols-12 gap-x-6 gap-y-5">
          <form className="col-span-12 lg:col-span-5 flex gap-2 items-end" action="/doctors">
            <div className="flex-1 min-w-0">
              <label className="eyebrow block mb-1.5" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Name, specialty, or language"
                className="field"
              />
            </div>
            {sp.specialty && (
              <input type="hidden" name="specialty" value={sp.specialty} />
            )}
            <button type="submit" className="btn btn-clay">
              Find
            </button>
          </form>

          <div className="col-span-12 lg:col-span-7 lg:pl-6 lg:border-l border-[color:var(--rule)]">
            <p className="eyebrow mb-2.5">Sort by</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
              {[
                ["rating", "Rating"],
                ["experience", "Experience"],
                ["fee_asc", "Fee, low to high"],
                ["fee_desc", "Fee, high to low"],
              ].map(([k, label]) => {
                const active = sortKey === k;
                return (
                  <Link
                    key={k}
                    href={sortHref(k)}
                    prefetch
                    className={
                      "transition-colors " +
                      (active
                        ? "text-ink underline underline-offset-4 decoration-clay decoration-[1.5px]"
                        : "text-ink-mute hover:text-ink")
                    }
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Specialty chips */}
      <section className="border-b border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-5">
          <div className="flex flex-wrap gap-x-1 gap-y-1.5 items-baseline">
            <span className="eyebrow text-ink-mute mr-3">By specialty</span>
            <SpecChip
              href={q ? `/doctors?q=${encodeURIComponent(q)}` : "/doctors"}
              label="All"
              active={!sp.specialty}
            />
            {specialties.map((s) => {
              const params = new URLSearchParams();
              params.set("specialty", s);
              if (q) params.set("q", q);
              return (
                <SpecChip
                  key={s}
                  href={`/doctors?${params.toString()}`}
                  label={s}
                  active={sp.specialty === s}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Index list */}
      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-12 sm:py-16 flex-1">
        <div className="flex items-baseline justify-between mb-6">
          <p className="eyebrow">
            {visible.length} {visible.length === 1 ? "result" : "results"}
            {q ? ` · "${q}"` : ""}
          </p>
          <p className="eyebrow text-ink-mute hidden sm:block">
            Page {page} of {totalPages}
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="border-y border-[color:var(--rule-strong)] py-16 text-center">
            <p className="serif-section text-[1.5rem]">
              No practitioners match.
            </p>
            <p className="mt-3 text-ink-mute text-[14px]">
              Try a different specialty, or{" "}
              <Link href="/doctors" className="text-clay underline">
                clear the filters
              </Link>
              .
            </p>
          </div>
        ) : (
          <ol>
            {visible.map((d, i) => {
              const indexNo = (page - 1) * PAGE_SIZE + i + 1;
              return (
                <li
                  key={d._id}
                  className="border-t border-[color:var(--rule)] last:border-b last:border-[color:var(--rule)] group"
                >
                  <Link
                    href={`/doctors/${d._id}`}
                    prefetch
                    className="grid grid-cols-12 gap-x-4 gap-y-2 py-5 sm:py-6 px-1 hover:bg-paper-tint transition-colors"
                  >
                    <span className="col-span-2 sm:col-span-1 mono text-ink-mute text-[12px] tabular pt-1">
                      {String(indexNo).padStart(2, "0")}
                    </span>

                    <div className="col-span-10 sm:col-span-5">
                      <span className="serif-section text-[clamp(1.05rem,2vw,1.4rem)] text-ink group-hover:text-clay transition-colors">
                        Dr. {d.user.name}
                      </span>
                      <p className="mono text-ink-mute text-[11px] tracking-[0.14em] uppercase mt-1.5">
                        {d.specialty} · {d.yearsOfExperience}y experience
                      </p>
                      {d.bio && (
                        <p className="mt-3 text-ink-soft text-[13.5px] leading-[1.55] max-w-[60ch] line-clamp-2">
                          {d.bio}
                        </p>
                      )}
                    </div>

                    <div className="col-span-12 sm:col-span-3 text-[12.5px] text-ink-mute leading-[1.55] sm:pt-1">
                      <p className="mono uppercase tracking-[0.14em] text-[10.5px] mb-1.5">
                        Languages
                      </p>
                      <p className="text-ink-soft text-[13px]">
                        {(d.languages ?? []).slice(0, 4).join(", ") || "English"}
                      </p>
                      {d.ratingCount > 0 ? (
                        <p className="mt-2 mono text-[11px] text-ink-mute tabular">
                          ★ {d.rating.toFixed(1)} · {d.ratingCount} reviews
                        </p>
                      ) : (
                        <p className="mt-2 mono text-[11px] text-moss tracking-[0.14em] uppercase">
                          New
                        </p>
                      )}
                    </div>

                    <div className="col-span-12 sm:col-span-3 sm:text-right sm:pt-1">
                      <p className="mono uppercase tracking-[0.14em] text-[10.5px] text-ink-mute mb-1.5">
                        Consultation
                      </p>
                      <p className="serif-section text-[1.25rem] text-ink tabular">
                        {formatINR(d.consultationFeeCents)}
                      </p>
                      <span className="inline-block mono text-[12px] text-ink-faint group-hover:text-clay transition-colors mt-2">
                        Read profile →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}

        {visible.length > 0 && totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-between border-t border-[color:var(--rule-strong)] pt-6"
          >
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="btn-link">
                <span aria-hidden>←</span> Previous
              </Link>
            ) : (
              <span aria-hidden />
            )}
            <span className="mono text-[12px] tracking-[0.14em] uppercase text-ink-mute tabular">
              {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </span>
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="btn-link">
                Next <span aria-hidden>→</span>
              </Link>
            ) : (
              <span aria-hidden />
            )}
          </nav>
        )}
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}

function SpecChip({
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
      className={
        "px-2.5 py-1 mono text-[10.5px] tracking-[0.14em] uppercase transition-colors " +
        (active
          ? "text-ink underline underline-offset-4 decoration-clay decoration-[1.5px]"
          : "text-ink-mute hover:text-ink")
      }
    >
      {label}
    </Link>
  );
}
