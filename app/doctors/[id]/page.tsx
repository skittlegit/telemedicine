import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { getSession } from "@/lib/authz";

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

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-[900px] px-5 sm:px-8 py-10">
        <Link href="/doctors" className="eyebrow text-ink-mute hover:text-clay">
          ← Practitioners
        </Link>

        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight mt-4 break-words">Dr. {doc.user.name}</h1>
        <p className="eyebrow mt-3">
          {doc.specialty} · {doc.yearsOfExperience} years · {doc.licenseRegion} #{doc.licenseNumber}
        </p>

        {doc.bio && (
          <p className="mt-8 text-ink-soft text-[17px] leading-[1.6] max-w-[60ch]">{doc.bio}</p>
        )}

        <hr className="rule my-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="eyebrow mb-3">Fee</p>
            <p className="mono text-3xl">${(doc.consultationFeeCents / 100).toFixed(2)}</p>
            <p className="text-xs text-ink-mute mt-1">per 30-minute consult</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Languages</p>
            <p className="text-sm">{doc.languages.length ? doc.languages.join(", ") : "—"}</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Rating</p>
            <p className="mono">
              {doc.ratingCount > 0 ? `${doc.rating.toFixed(1)} / 5` : "Unrated"}
              {doc.ratingCount > 0 && (
                <span className="text-ink-mute"> · {doc.ratingCount} reviews</span>
              )}
            </p>
          </div>
        </div>

        {doc.availability.length > 0 && (
          <>
            <hr className="rule my-10" />
            <p className="eyebrow mb-3">Weekly availability (UTC)</p>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 mono text-sm">
              {doc.availability.map((a, i) => (
                <li key={i} className="border border-[color:var(--rule)] px-3 py-2">
                  {DOW[a.dow]} · {fmtMins(a.startMinutes)} – {fmtMins(a.endMinutes)}
                </li>
              ))}
            </ul>
          </>
        )}

        <hr className="rule my-10" />

        <div className="flex flex-wrap gap-3">
          {session?.user ? (
            session.user.role === "patient" ? (
              <Link href={`/book/${doc._id}`} className="btn btn-clay">
                Book a consultation →
              </Link>
            ) : (
              <p className="text-ink-mute italic text-sm">
                Bookings are available to patient accounts.
              </p>
            )
          ) : (
            <Link
              href={`/login?callbackUrl=/book/${doc._id}`}
              className="btn btn-clay"
            >
              Sign in to book →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
