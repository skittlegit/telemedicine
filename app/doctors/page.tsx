import Link from "next/link";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";

export const metadata = { title: "Practitioners — Vellum Health" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ specialty?: string }>;
}

interface DoctorRow {
  _id: string;
  specialty: string;
  bio: string;
  yearsOfExperience: number;
  consultationFeeCents: number;
  rating: number;
  ratingCount: number;
  user: { _id: string; name: string };
}

export default async function DoctorsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  await connectDB();
  // Make sure the User schema is registered for populate (idempotent).
  void User;

  const filter: Record<string, unknown> = {};
  if (sp.specialty) filter.specialty = sp.specialty;

  const doctors = await DoctorProfile.find(filter)
    .populate("user", "name status")
    .sort({ rating: -1, ratingCount: -1 })
    .limit(60)
    .lean<DoctorRow[]>();

  const visible = doctors.filter((d) => d.user);

  const specialties = await DoctorProfile.distinct("specialty");

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-[color:var(--rule)]">
        <div className="mx-auto w-full max-w-[1240px] px-8 py-6 flex items-baseline justify-between">
          <Link href="/" className="font-display text-[20px] tracking-[-0.02em] leading-none">
            Vellum<span className="italic-accent"> Health</span>
          </Link>
          <nav className="eyebrow flex gap-7">
            <Link href="/login" className="hover:text-clay">Sign in</Link>
            <Link href="/register" className="hover:text-clay">Register</Link>
          </nav>
        </div>
        <div className="mx-auto w-full max-w-[1240px] px-8 pt-10 pb-12">
          <p className="eyebrow">The directory</p>
          <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6rem)] tracking-[-0.03em] leading-[0.95]">
            Practitioners <span className="italic-accent">in residence.</span>
          </h1>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1200px] px-8 py-10">
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/doctors"
              className={`px-3 py-1 border border-[color:var(--rule-strong)] text-xs uppercase tracking-wider ${!sp.specialty ? "bg-ink text-paper" : "hover:bg-paper-tint"}`}
            >
              All
            </Link>
            {specialties.map((s) => (
              <Link
                key={s}
                href={`/doctors?specialty=${encodeURIComponent(s)}`}
                className={`px-3 py-1 border border-[color:var(--rule-strong)] text-xs uppercase tracking-wider ${sp.specialty === s ? "bg-ink text-paper" : "hover:bg-paper-tint"}`}
              >
                {s}
              </Link>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <p className="text-ink-mute italic">
            No practitioners listed yet. Clinicians can{" "}
            <Link href="/register?role=doctor" className="text-clay underline">
              apply for licensure review
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
            {visible.map((d) => (
              <li
                key={d._id}
                className="border-t border-[color:var(--rule)] py-6 grid grid-cols-[1fr_auto] gap-4"
              >
                <div>
                  <h3 className="font-display text-2xl tracking-tight">
                    Dr. {d.user.name}
                  </h3>
                  <p className="eyebrow mt-1">{d.specialty} · {d.yearsOfExperience}y exp.</p>
                  {d.bio && <p className="mt-3 text-sm text-ink-soft max-w-[42ch]">{d.bio}</p>}
                </div>
                <div className="flex flex-col items-end justify-between text-right">
                  <span className="mono text-sm">
                    ${(d.consultationFeeCents / 100).toFixed(2)}
                  </span>
                  <Link
                    href={`/doctors/${d._id}`}
                    className="btn btn-ghost mt-3 text-xs"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
