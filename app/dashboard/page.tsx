import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { requireSession } from "@/lib/authz";
import {
  PageHeader,
  StatGrid,
  StatTile,
  Section,
  EmptyState,
} from "@/app/dashboard/_components/Shell";
import { BookedBanner } from "@/app/dashboard/_components/BookedBanner";
import {
  ApptRowItem,
  NextConsultationCard,
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

  const [upcomingCount, next, activeRxCount, openOrdersCount] =
    await Promise.all([
      Appointment.countDocuments({
        patient: userId,
        status: { $in: ["scheduled", "in_progress"] },
        startAt: { $gte: new Date(now.getTime() - JOIN_WINDOW_MS) },
      }),
      Appointment.findOne({
        patient: userId,
        status: { $in: ["scheduled", "in_progress"] },
        startAt: { $gte: new Date(now.getTime() - JOIN_WINDOW_MS) },
      })
        .populate("doctor", "name")
        .populate("patient", "name")
        .sort({ startAt: 1 })
        .lean<ApptRow | null>(),
      Prescription.countDocuments({
        patient: userId,
        fulfilledAt: { $exists: false },
        revokedAt: { $exists: false },
      }),
      PharmacyOrder.countDocuments({
        patient: userId,
        status: { $nin: ["delivered", "cancelled"] },
      }),
    ]);

  const firstName = displayName.split(" ")[0];

  return (
    <>
      <Suspense fallback={null}>
        <BookedBanner />
      </Suspense>
      <PageHeader
        eyebrow="Today"
        title="Welcome back,"
        italic={`${firstName}.`}
      >
        Your next visit, your active prescriptions, and what&apos;s waiting at
        the pharmacy — at a glance.
      </PageHeader>

      <StatGrid cols={3}>
        <StatTile
          label="Upcoming visits"
          value={upcomingCount}
          hint="Scheduled or in progress"
        />
        <StatTile
          label="Active prescriptions"
          value={activeRxCount}
          hint="Not yet fulfilled"
        />
        <StatTile
          label="Pharmacy in progress"
          value={openOrdersCount}
          hint="Orders being prepared or shipped"
        />
      </StatGrid>

      {next ? (
        <div className="mt-10">
          <NextConsultationCard appt={next} />
        </div>
      ) : (
        <Section eyebrow="Your next visit" title="Nothing on the calendar">
          <EmptyState
            message="No upcoming visits. Find a doctor and book your first."
            cta={
              <Link href="/dashboard/doctors" className="btn btn-clay text-xs">
                Find a doctor →
              </Link>
            }
          />
        </Section>
      )}

      <Section eyebrow="Quick actions" title="Jump to">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          <Link
            href="/dashboard/visits"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              All visits →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Upcoming, in-progress, and past consultations.
            </p>
          </Link>
          <Link
            href="/dashboard/prescriptions"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Prescriptions →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Active scripts, signed PDFs, and history.
            </p>
          </Link>
          <Link
            href="/dashboard/orders"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Pharmacy orders →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Track prescriptions sent for fulfilment.
            </p>
          </Link>
          <Link
            href="/dashboard/doctors"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Find a doctor →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Browse 50+ specialties and book a same-day visit.
            </p>
          </Link>
          <Link
            href="/dashboard/records"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Medical record →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Consolidated visit summaries and notes.
            </p>
          </Link>
          <Link
            href="/dashboard/profile"
            className="bg-paper p-5 hover:bg-paper-tint transition-colors"
          >
            <p className="font-display text-[1.2rem] tracking-tight">
              Account →
            </p>
            <p className="text-ink-soft text-[13px] mt-2">
              Contact details, verification, and privacy controls.
            </p>
          </Link>
        </div>
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
        your panel · ${(profile?.consultationFeeCents ?? 5000) / 100} per
        consult
      </PageHeader>

      {profile && (
        <div
          className={`mb-10 border p-4 flex flex-wrap items-center justify-between gap-3 ${
            verified
              ? "border-moss/40 bg-moss/5"
              : "border-amber/40 bg-amber/10"
          }`}
        >
          <div>
            <p className="eyebrow mb-1">Licensure</p>
            <p
              className={`text-sm ${verified ? "text-moss" : "text-amber"}`}
            >
              {verified
                ? `Verified by Vellum on ${new Date(profile.licenseVerifiedAt!).toLocaleDateString()}`
                : "Pending admin verification — your account is read-only until approved."}
            </p>
          </div>
          <Link
            href="/dashboard/clinician/profile"
            className="btn btn-ghost text-xs"
          >
            Manage profile →
          </Link>
        </div>
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
