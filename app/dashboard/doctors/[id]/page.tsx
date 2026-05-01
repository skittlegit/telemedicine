import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { PageHeader, Section } from "@/app/dashboard/_components/Shell";
import { StarIcon } from "@/app/_components/icons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DoctorView {
  _id: string;
  specialty: string;
  bio: string;
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

export default async function DashboardDoctorPage({ params }: PageProps) {
  await requireRole("patient");
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  void User;

  const doc = await DoctorProfile.findById(id)
    .populate("user", "name")
    .lean<DoctorView | null>();
  if (!doc || !doc.user) notFound();

  return (
    <>
      <Link
        href="/dashboard/doctors"
        className="eyebrow text-ink-mute hover:text-clay inline-block mb-4"
      >
        ← Find a doctor
      </Link>

      <PageHeader
        eyebrow={doc.specialty}
        title={`Dr. ${doc.user.name}`}
        italic={`· ${doc.yearsOfExperience} yrs experience`}
      >
        {doc.licenseRegion ? `Licensed in ${doc.licenseRegion}.` : null}
      </PageHeader>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Left: bio + availability */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Section title="About">
            <div className="flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-full bg-clay-wash text-clay text-[18px] font-semibold flex items-center justify-center shrink-0"
                aria-hidden
              >
                {initialsOf(doc.user.name)}
              </div>
              <div className="flex-1">
                {doc.ratingCount > 0 && (
                  <p className="inline-flex items-center gap-1.5 eyebrow text-amber mb-2">
                    <StarIcon className="w-3.5 h-3.5" />
                    {doc.rating.toFixed(1)} · {doc.ratingCount} reviews
                  </p>
                )}
                <p className="text-ink-soft text-[14.5px] leading-[1.65] whitespace-pre-line">
                  {doc.bio || "No bio provided."}
                </p>
                {doc.languages?.length > 0 && (
                  <p className="mt-4 text-[13px] text-ink-mute">
                    <span className="eyebrow mr-2">Languages</span>
                    {doc.languages.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Section title="Weekly availability">
            {doc.availability?.length ? (
              <ul className="divide-y divide-[color:var(--rule)]">
                {doc.availability.map((a, i) => (
                  <li
                    key={i}
                    className="py-2.5 flex items-center justify-between text-[13.5px]"
                  >
                    <span className="font-medium">{DOW[a.dow]}</span>
                    <span className="mono text-ink-soft">
                      {fmtMins(a.startMinutes)} – {fmtMins(a.endMinutes)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-mute text-[13px]">
                Availability not posted. Reach out via booking.
              </p>
            )}
          </Section>
        </div>

        {/* Right: booking CTA */}
        <div className="col-span-12 lg:col-span-4">
          <div className="border border-[color:var(--rule-strong)] bg-paper-tint p-5 sticky top-24">
            <p className="eyebrow mb-2">Consultation</p>
            <p className="text-[34px] font-semibold tracking-[-0.02em] leading-none">
              {formatINR(doc.consultationFeeCents)}
            </p>
            <p className="text-ink-mute text-[12.5px] mt-1.5">30-minute video visit</p>
            <Link
              href={`/book/${doc._id}`}
              className="btn btn-clay w-full justify-center mt-5"
            >
              Book a slot →
            </Link>
            <ul className="mt-5 space-y-2 text-[12.5px] text-ink-soft">
              <li className="flex gap-2">
                <span className="text-moss" aria-hidden>
                  ✓
                </span>{" "}
                Encrypted video, no install
              </li>
              <li className="flex gap-2">
                <span className="text-moss" aria-hidden>
                  ✓
                </span>{" "}
                Scripts routed to your pharmacy
              </li>
              <li className="flex gap-2">
                <span className="text-moss" aria-hidden>
                  ✓
                </span>{" "}
                Refunded if we can&apos;t help
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
