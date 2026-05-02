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
    ? "Sign in to book"
    : role === "patient"
      ? "Book a consultation"
      : null;

  return (
    <main className="min-h-screen flex flex-col bg-paper text-ink">
      <MarketingHeader {...headerProps} />

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-10">
        <div className="masthead">
          <span>The directory · profile</span>
          <span className="meta">{doc.specialty}</span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-6">
        <Link href="/doctors" className="btn-link">
          <span aria-hidden>←</span> Back to the directory
        </Link>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-12 grid grid-cols-12 gap-x-8 gap-y-10">
        <div className="col-span-12 lg:col-span-8">
          <p className="eyebrow">{doc.specialty}</p>
          <h1 className="serif-display mt-4 text-[clamp(2.5rem,7vw,5.75rem)] break-words">
            Dr. {doc.user.name}
            {doc.ratingCount > 0 && (
              <span className="italic-accent block text-[clamp(1.5rem,4vw,3rem)] mt-2">
                rated {doc.rating.toFixed(1)} of five.
              </span>
            )}
          </h1>
          <p className="mono text-[12px] tracking-[0.14em] uppercase text-ink-mute mt-6">
            {doc.licenseRegion} #{doc.licenseNumber} · {doc.yearsOfExperience} years experience
          </p>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-[color:var(--rule)]">
          <p className="eyebrow">Consultation fee</p>
          <p className="serif-display mt-3 text-[clamp(2.5rem,5vw,3.5rem)] tabular">
            {formatINR(doc.consultationFeeCents)}
          </p>
          <p className="sidenote mt-3">
            <strong>Format</strong>
            Thirty-minute video visit, encrypted end to end on the consult
            leg. Reschedule or cancel free up to the slot opening.
          </p>
          {ctaHref && ctaLabel ? (
            <Link href={ctaHref} className="btn btn-clay btn-lg mt-6 w-full justify-center">
              {ctaLabel} <span aria-hidden>→</span>
            </Link>
          ) : (
            <p className="mt-6 text-ink-mute text-[13px] italic">
              Bookings are available to patient accounts.
            </p>
          )}
        </aside>
      </section>

      <section className="border-t border-[color:var(--rule-strong)] bg-paper">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10 py-14 grid grid-cols-12 gap-x-8 gap-y-10">
          <div className="col-span-12 lg:col-span-8">
            <p className="eyebrow">About</p>
            {doc.bio ? (
              <p className="mt-4 text-[16px] leading-[1.7] text-ink-soft max-w-[62ch]">
                {doc.bio}
              </p>
            ) : (
              <p className="mt-4 text-ink-mute text-[14.5px] italic">
                The clinician has not yet filed a personal note.
              </p>
            )}

            {doc.availability.length > 0 && (
              <div className="mt-12">
                <p className="eyebrow">Weekly availability, UTC</p>
                <dl className="mt-4 border-t border-[color:var(--rule)]">
                  {doc.availability.map((a, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-4 py-3 border-b border-[color:var(--rule)]"
                    >
                      <dt className="col-span-3 mono text-[12px] tracking-[0.14em] uppercase text-ink-mute pt-1">
                        {DOW[a.dow]}
                      </dt>
                      <dd className="col-span-9 mono text-[14px] tabular text-ink">
                        {fmtMins(a.startMinutes)} <span className="text-ink-mute">to</span>{" "}
                        {fmtMins(a.endMinutes)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-[color:var(--rule)]">
            <dl>
              {[
                ["Languages", doc.languages.length ? doc.languages.join(", ") : "English"],
                ["Experience", `${doc.yearsOfExperience} years`],
                ["Licensure", `${doc.licenseRegion} #${doc.licenseNumber}`],
                [
                  "Rating",
                  doc.ratingCount > 0
                    ? `${doc.rating.toFixed(1)} / 5 · ${doc.ratingCount} reviews`
                    : "Unrated · awaiting first cohort",
                ],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={
                    "py-4 " +
                    (i === 0 ? "border-t border-b border-[color:var(--rule)]" : "border-b border-[color:var(--rule)]")
                  }
                >
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1.5 text-[14px] text-ink leading-[1.5] break-words">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <MarketingFooter logoHref={headerProps.logoHref} />
    </main>
  );
}
