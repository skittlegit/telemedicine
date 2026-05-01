import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { getSession } from "@/lib/authz";
import { formatINR } from "@/lib/money";
import {
  MarketingHeader,
  MarketingFooter,
} from "@/app/_components/MarketingChrome";
import { marketingHeaderProps } from "@/app/_components/marketingHeaderProps";
import { StarIcon } from "@/app/_components/icons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DoctorView {
  _id: string;
  specialty: string;
  bio: string;
  licenseNumber: string;
  licenseRegion: string;
  yearsOfExperience: number;
  languages: string[];
  consultationFeeCents: number;
  rating: number;
  ratingCount: number;
  availability: Array<{ dow: number; startMinutes: number; endMinutes: number }>;
  user: { _id: string; name: string };
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function fmtMins(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export default async function DoctorPage({ params }: PageProps) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  void User;
  const doc = await DoctorProfile.findById(id)
    .populate("user", "name")
    .lean<DoctorView | null>();
  if (!doc || !doc.user) notFound();

  const session = await getSession();
  const headerProps = await marketingHeaderProps();

  const role = (session?.user as { role?: string } | undefined)?.role;
  const ctaHref = !session?.user
    ? `/login?callbackUrl=/book/${doc._id}`
    : role === "patient"
      ? `/book/${doc._id}`
      : null;
  const ctaLabel = !session?.user
    ? "Sign in to book →"
    : role === "patient"
      ? "Book a consultation →"
      : null;

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1100px] px-5 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
        <Link
          href="/doctors"
          className="eyebrow text-ink-mute hover:text-clay"
        >
          ← Practitioners
        </Link>

        <div className="mt-5 grid grid-cols-12 gap-x-8 gap-y-6">
          <div className="col-span-12 md:col-span-8 flex items-start gap-4 sm:gap-5">
            <div
              aria-hidden
              className="shrink-0 w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] border border-[color:var(--rule-strong)] bg-paper-tint flex items-center justify-center text-ink-soft text-[22px] sm:text-[26px] font-semibold tracking-[-0.012em]"
            >
              {initialsOf(doc.user.name)}
            </div>
            <div className="min-w-0">
              <p className="eyebrow">{doc.specialty}</p>
              <h1 className="mt-2 text-[28px] sm:text-[40px] lg:text-[44px] font-semibold tracking-[-0.025em] leading-[1.05] break-words">
                Dr. {doc.user.name}
              </h1>
              <p className="mt-3 text-ink-mute text-[13px] mono">
                {doc.licenseRegion} #{doc.licenseNumber} · {doc.yearsOfExperience} yrs
              </p>
              {doc.ratingCount > 0 && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-ink-soft">
                  <span className="text-amber [&>svg]:w-4 [&>svg]:h-4">
                    <StarIcon />
                  </span>
                  {doc.rating.toFixed(1)} / 5
                  <span className="text-ink-mute">· {doc.ratingCount} reviews</span>
                </p>
              )}
            </div>
          </div>

          <aside className="col-span-12 md:col-span-4">
            <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-5 md:sticky md:top-24">
              <p className="eyebrow mb-2">Consultation</p>
              <p className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] leading-none">
                {formatINR(doc.consultationFeeCents)}
              </p>
              <p className="text-ink-mute text-[12.5px] mt-1.5">
                30-minute video visit
              </p>
              {ctaHref && ctaLabel ? (
                <Link
                  href={ctaHref}
                  className="btn btn-clay w-full justify-center mt-5"
                >
                  {ctaLabel}
                </Link>
              ) : (
                <p className="mt-5 text-ink-mute italic text-[12.5px]">
                  Bookings are available to patient accounts.
                </p>
              )}
              <ul className="mt-5 space-y-2 text-[12.5px] text-ink-soft">
                <li className="flex gap-2">
                  <span className="text-moss" aria-hidden>✓</span>
                  Encrypted video, no install
                </li>
                <li className="flex gap-2">
                  <span className="text-moss" aria-hidden>✓</span>
                  Digitally signed prescription
                </li>
                <li className="flex gap-2">
                  <span className="text-moss" aria-hidden>✓</span>
                  Free cancellation up to start
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1100px] px-5 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          <div className="col-span-12 md:col-span-8">
            {doc.bio && (
              <>
                <p className="eyebrow mb-3">About</p>
                <p className="text-ink-soft text-[15px] leading-[1.65] max-w-[60ch]">
                  {doc.bio}
                </p>
              </>
            )}

            {doc.availability.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow mb-3">Weekly availability (UTC)</p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 mono text-[13px]">
                  {doc.availability.map((a, i) => (
                    <li
                      key={i}
                      className="border border-[color:var(--rule)] bg-paper px-3 py-2"
                    >
                      {DOW[a.dow]} · {fmtMins(a.startMinutes)}–{fmtMins(a.endMinutes)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="col-span-12 md:col-span-4">
            <dl className="grid grid-cols-2 md:grid-cols-1 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
              <div className="bg-paper p-4">
                <dt className="eyebrow mb-1.5">Languages</dt>
                <dd className="text-[13.5px]">
                  {doc.languages.length ? doc.languages.join(", ") : "—"}
                </dd>
              </div>
              <div className="bg-paper p-4">
                <dt className="eyebrow mb-1.5">Experience</dt>
                <dd className="text-[13.5px]">{doc.yearsOfExperience} years</dd>
              </div>
              <div className="bg-paper p-4">
                <dt className="eyebrow mb-1.5">Licensure</dt>
                <dd className="mono text-[12.5px] break-all">
                  {doc.licenseRegion} #{doc.licenseNumber}
                </dd>
              </div>
              <div className="bg-paper p-4">
                <dt className="eyebrow mb-1.5">Rating</dt>
                <dd className="text-[13.5px]">
                  {doc.ratingCount > 0
                    ? `${doc.rating.toFixed(1)} / 5 · ${doc.ratingCount} reviews`
                    : "Unrated"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
