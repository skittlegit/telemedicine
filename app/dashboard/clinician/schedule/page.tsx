import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
  StatGrid,
  StatTile,
} from "@/app/dashboard/_components/Shell";
import { ApptRowItem, type ApptRow } from "@/app/dashboard/_lib/shared";

export const dynamic = "force-dynamic";

export default async function ClinicianSchedulePage() {
  const session = await requireRole("doctor");
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

  await connectDB();
  const [todays, week, past] = await Promise.all([
    Appointment.find({
      doctor: userId,
      startAt: { $gte: startOfToday, $lt: endOfToday },
    })
      .populate("patient", "name")
      .populate("doctor", "name")
      .sort({ startAt: 1 })
      .lean<ApptRow[]>(),
    Appointment.find({
      doctor: userId,
      startAt: { $gte: endOfToday, $lt: endOfWeek },
    })
      .populate("patient", "name")
      .populate("doctor", "name")
      .sort({ startAt: 1 })
      .lean<ApptRow[]>(),
    Appointment.find({
      doctor: userId,
      status: { $in: ["completed", "cancelled", "no_show"] },
    })
      .populate("patient", "name")
      .populate("doctor", "name")
      .sort({ startAt: -1 })
      .limit(20)
      .lean<ApptRow[]>(),
  ]);

  return (
    <>
      <PageHeader eyebrow="Calendar" title="Schedule">
        Today, this week, and past consultations.
      </PageHeader>

      <StatGrid cols={3}>
        <StatTile label="Today" value={todays.length} />
        <StatTile label="This week" value={week.length} />
        <StatTile label="Recent past" value={past.length} hint="Last 20" />
      </StatGrid>

      <Section eyebrow="Today" title={startOfToday.toLocaleDateString()}>
        {todays.length === 0 ? (
          <EmptyState message="Nothing on today's calendar." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {todays.map((a) => (
              <ApptRowItem key={a._id} appt={a} as="doctor" />
            ))}
          </ul>
        )}
      </Section>

      <Section eyebrow="This week" title="Upcoming">
        {week.length === 0 ? (
          <EmptyState message="No visits scheduled this week." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {week.map((a) => (
              <ApptRowItem key={a._id} appt={a} as="doctor" />
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
              <ApptRowItem key={a._id} appt={a} as="doctor" />
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
