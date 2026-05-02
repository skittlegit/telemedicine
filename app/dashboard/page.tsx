import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { requireSession } from "@/lib/authz";
import {
  PageHeader,
  StatGrid,
  StatTile,
  Section,
  EmptyState,
  LicenseBanner,
} from "@/app/dashboard/_components/Shell";
import { formatINR } from "@/lib/money";
import { BookedBanner } from "@/app/dashboard/_components/BookedBanner";
import {
  ApptRowItem,
  type ApptRow,
  JOIN_WINDOW_MS,
} from "@/app/dashboard/_lib/shared";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role;

  if (role === "pharmacist") redirect("/dashboard/pharmacy");
  if (role === "admin") redirect("/dashboard/admin");

  await connectDB();

  if (role === "doctor") return <ClinicianView session={session} />;
  return <PatientView session={session} />;
}

/* ============================================================
   PATIENT — Today overview only. Lists moved to sub-routes.
   ============================================================ */

async function PatientView({
  session,
}: {
  session: { user: { id: string; name?: string | null; role: string } };
}) {
  const displayName = session.user.name ?? "there";
  const userId = session.user.id;
  const now = new Date();

  await connectDB();
  void User;

  const [next, recentAppts, recentRx, recentOrders, verified] = await Promise.all([
    Appointment.findOne({
      patient: userId,
      status: { $in: ["scheduled", "in_progress"] },
      startAt: { $gte: new Date(now.getTime() - JOIN_WINDOW_MS) },
    })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: 1 })
      .lean<ApptRow | null>(),
    Appointment.find({ patient: userId })
      .populate("doctor", "name")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean<Array<{ _id: string; startAt: Date; createdAt: Date; status: string; doctor?: { name: string } }>>(),
    Prescription.find({ patient: userId })
      .populate("doctor", "name")
      .sort({ issuedAt: -1 })
      .limit(3)
      .lean<Array<{ _id: string; issuedAt: Date; drugs: Array<{ name: string }>; doctor?: { name: string } }>>(),
    PharmacyOrder.find({ patient: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean<Array<{ _id: string; status: string; createdAt: Date }>>(),
    User.findById(userId)
      .select("emailVerifiedAt")
      .lean<{ emailVerifiedAt?: Date } | null>(),
  ]);

  const firstName = displayName.split(" ")[0];
  const isVerified = !!verified?.emailVerifiedAt;

  // Build "Recent activity" — flatten cross-domain into 3 most recent.
  type Activity = {
    when: Date;
    title: string;
    detail: string;
    href: string;
  };
  const activities: Activity[] = [
    ...recentAppts.map<Activity>((a) => ({
      when: a.createdAt,
      title: `Visit with Dr. ${a.doctor?.name ?? "your clinician"}`,
      detail: new Date(a.startAt).toLocaleString(),
      href: "/dashboard/visits",
    })),
    ...recentRx.map<Activity>((r) => ({
      when: r.issuedAt,
      title: `Prescription · ${r.drugs.map((d) => d.name).slice(0, 2).join(", ")}${r.drugs.length > 2 ? "…" : ""}`,
      detail: `Issued ${new Date(r.issuedAt).toLocaleDateString()} · Dr. ${r.doctor?.name ?? ""}`.trim(),
      href: "/dashboard/visits",
    })),
    ...recentOrders.map<Activity>((o) => ({
      when: o.createdAt,
      title: `Pharmacy order ${String(o._id).slice(-6).toUpperCase()}`,
      detail: `${o.status.replace(/_/g, " ")} · ${new Date(o.createdAt).toLocaleDateString()}`,
      href: `/dashboard/orders/${o._id}`,
    })),
  ]
    .sort((a, b) => b.when.getTime() - a.when.getTime())
    .slice(0, 3);

  // Single-line state for the Today card
  let todayLine: { text: string; cta: { href: string; label: string } };
  if (next) {
    const startAt = new Date(next.startAt);
    const within = Date.now() >= startAt.getTime() - JOIN_WINDOW_MS;
    todayLine = {
      text: within
        ? `Your visit with Dr. ${next.doctor.name} is ready to join now.`
        : `Next visit: ${startAt.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} with Dr. ${next.doctor.name}.`,
      cta: within
        ? { href: `/visits/${next._id}/room`, label: "Join visit →" }
        : { href: "/dashboard/visits", label: "See visit →" },
    };
  } else {
    todayLine = {
      text: "Nothing on your calendar. Find a doctor to book your first visit.",
      cta: { href: "/doctors", label: "Find a doctor →" },
    };
  }

  return (
    <>
      <Suspense fallback={null}>
        <BookedBanner />
      </Suspense>
      <PageHeader
        eyebrow="Today"
        title="Welcome back,"
        italic={`${firstName}.`}
      />

      {/* Today's status card — calm, single-purpose */}
      <section className="mt-2 border border-[color:var(--rule-strong)] bg-paper p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="eyebrow text-ink-mute">Today</span>
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 mono text-[10.5px] tracking-[0.14em] uppercase text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" /> Identity verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 mono text-[10.5px] tracking-[0.14em] uppercase text-amber">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" /> Email unverified
            </span>
          )}
        </div>
        <p className="text-[18px] sm:text-[20px] tracking-[-0.012em] leading-[1.4] text-ink max-w-[58ch]">
          {todayLine.text}
        </p>
        <div className="mt-5">
          <Link href={todayLine.cta.href} className="btn btn-clay btn-sm">
            {todayLine.cta.label}
          </Link>
        </div>
      </section>

      {/* heartbeat divider — clinical signature between hero and feed */}
      <div className="my-12 heartbeat-rule" aria-hidden />

      {/* Recent activity */}
      <Section
        eyebrow="Recent activity"
        title="What's new"
        action={
          <Link href="/dashboard/visits" className="eyebrow hover:text-clay">
            All visits →
          </Link>
        }
      >
        {activities.length === 0 ? (
          <EmptyState message="No activity yet. Your visits, prescriptions, and orders will appear here." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {activities.map((a) => (
              <li key={`${a.title}-${a.when.getTime()}`}>
                <Link
                  href={a.href}
                  className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-paper-tint transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium tracking-[-0.01em] truncate">
                      {a.title}
                    </p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5 truncate">
                      {a.detail}
                    </p>
                  </div>
                  <span className="eyebrow text-clay shrink-0">View →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

/* ============================================================
   CLINICIAN — Today overview only. Schedule + Rx live in sub-routes.
   ============================================================ */

async function ClinicianView({
  session,
}: {
  session: { user: { id: string; name?: string | null; role: string } };
}) {
  const displayName = session.user.name ?? "Doctor";
  const userId = session.user.id;
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const last30 = new Date(now);
  last30.setDate(last30.getDate() - 30);

  const [profile, todaysCount, weekCount, panelIds, rx30Count, nextAppt] =
    await Promise.all([
      DoctorProfile.findOne({ user: userId }).lean<{
        specialty: string;
        licenseVerifiedAt?: Date;
        consultationFeeCents: number;
      } | null>(),
      Appointment.countDocuments({
        doctor: userId,
        startAt: { $gte: startOfToday, $lt: endOfToday },
      }),
      Appointment.countDocuments({
        doctor: userId,
        startAt: { $gte: endOfToday, $lt: endOfWeek },
      }),
      Appointment.distinct("patient", { doctor: userId }),
      Prescription.countDocuments({
        doctor: userId,
        issuedAt: { $gte: last30 },
      }),
      Appointment.findOne({
        doctor: userId,
        status: { $in: ["scheduled", "in_progress"] },
        startAt: { $gte: new Date(now.getTime() - JOIN_WINDOW_MS) },
      })
        .populate("patient", "name")
        .populate("doctor", "name")
        .sort({ startAt: 1 })
        .lean<ApptRow | null>(),
    ]);

  const verified = !!profile?.licenseVerifiedAt;
  const lastName = displayName.split(" ").slice(-1)[0];

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Good morning,"
        italic={`Dr. ${lastName}.`}
      >
        {profile?.specialty ?? "Clinician"} · {panelIds.length} patients in
        your panel · {formatINR(profile?.consultationFeeCents ?? 5000)} per
        consult
      </PageHeader>

      {profile && (
        <LicenseBanner
          verified={verified}
          verifiedAt={profile.licenseVerifiedAt}
          manageHref="/dashboard/clinician/profile"
        />
      )}

      <StatGrid cols={4}>
        <StatTile label="Today's visits" value={todaysCount} />
        <StatTile label="This week" value={weekCount} />
        <StatTile label="Rx issued (30d)" value={rx30Count} />
        <StatTile label="Panel" value={panelIds.length} hint="Patients seen" />
      </StatGrid>

      <Section eyebrow="Up next" title="Imminent visit">
        {nextAppt ? (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            <ApptRowItem appt={nextAppt} as="doctor" />
          </ul>
        ) : (
          <EmptyState message="No active or imminent visits on your calendar." />
        )}
      </Section>

      <Section eyebrow="Workspaces" title="Jump to">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          <Link
            href="/dashboard/clinician/schedule"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Schedule →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Today, this week, and recent past visits.
            </p>
          </Link>
          <Link
            href="/dashboard/clinician/prescriptions"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Prescriptions →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Issued by you · active scripts and history.
            </p>
          </Link>
          <Link
            href="/dashboard/clinician/profile"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Profile →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Bio, specialty, fees, and licensure details.
            </p>
          </Link>
        </div>
      </Section>
    </>
  );
}
