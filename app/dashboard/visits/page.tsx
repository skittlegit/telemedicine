import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
} from "@/app/dashboard/_components/Shell";
import {
  ApptRowItem,
  type ApptRow,
  JOIN_WINDOW_MS,
} from "@/app/dashboard/_lib/shared";

export const dynamic = "force-dynamic";

export default async function PatientVisitsPage() {
  const session = await requireRole("patient");
  const userId = session.user.id;
  const now = new Date();

  await connectDB();
  const [upcoming, past] = await Promise.all([
    Appointment.find({
      patient: userId,
      status: { $in: ["scheduled", "in_progress"] },
      startAt: { $gte: new Date(now.getTime() - JOIN_WINDOW_MS) },
    })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: 1 })
      .lean<ApptRow[]>(),
    Appointment.find({
      patient: userId,
      status: { $in: ["completed", "cancelled", "no_show"] },
    })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: -1 })
      .limit(20)
      .lean<ApptRow[]>(),
  ]);

  return (
    <>
      <PageHeader eyebrow="Calendar" title="Your visits">
        Upcoming, in progress, and historical consultations.
      </PageHeader>

      <Section
        eyebrow="Upcoming"
        title="Scheduled & in progress"
        action={
          <Link href="/doctors" className="btn btn-ghost text-xs">
            Book another →
          </Link>
        }
      >
        {upcoming.length === 0 ? (
          <EmptyState
            message="No upcoming visits."
            cta={
              <Link href="/doctors" className="btn btn-clay text-xs">
                Find a doctor →
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {upcoming.map((a) => (
              <ApptRowItem key={a._id} appt={a} as="patient" />
            ))}
          </ul>
        )}
      </Section>

      <Section eyebrow="History" title="Past visits">
        {past.length === 0 ? (
          <EmptyState message="No past visits yet." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {past.map((a) => (
              <ApptRowItem key={a._id} appt={a} as="patient" />
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
