import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { User } from "@/lib/models/User";
import { requireSession } from "@/lib/authz";
import {
  DashboardHeader,
  PageHeader,
  StatGrid,
  StatTile,
  Section,
  EmptyState,
  StatusPill,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface ApptRow {
  _id: string;
  startAt: Date;
  endAt: Date;
  status: string;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
}
interface RxRow {
  _id: string;
  issuedAt: Date;
  drugs: Array<{ name: string }>;
  doctor: { _id: string; name: string };
  patient: { _id: string; name: string };
  fulfilledAt?: Date;
  revokedAt?: Date;
}
interface OrderRow {
  _id: string;
  status: string;
  createdAt: Date;
  prescription: string;
}

const JOIN_WINDOW_MS = 15 * 60 * 1000;

function relativeWhen(d: Date): string {
  const ms = d.getTime() - Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (ms < 0) return "started";
  if (ms < 60 * 60 * 1000) return `in ${Math.max(1, Math.round(ms / 60000))} min`;
  if (ms < day) return `today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (ms < 2 * day) return `tomorrow, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  return d.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit", month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role;

  if (role === "pharmacist") redirect("/dashboard/pharmacy");
  if (role === "admin") redirect("/dashboard/admin");

  await connectDB();
  void User;

  if (role === "doctor") return <ClinicianView session={session} />;
  return <PatientView session={session} />;
}

/* ============================================================
   PATIENT VIEW
   ============================================================ */

async function PatientView({
  session,
}: {
  session: { user: { id: string; name?: string | null; role: string } };
}) {
  const displayName = session.user.name ?? "there";
  const userId = session.user.id;
  const now = new Date();

  const [upcoming, recentAppts, prescriptions, orders] = await Promise.all([
    Appointment.find({
      patient: userId,
      status: { $in: ["scheduled", "in_progress"] },
      startAt: { $gte: new Date(now.getTime() - JOIN_WINDOW_MS) },
    })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: 1 })
      .limit(8)
      .lean<ApptRow[]>(),
    Appointment.find({ patient: userId, status: { $in: ["completed", "cancelled", "no_show"] } })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ startAt: -1 })
      .limit(5)
      .lean<ApptRow[]>(),
    Prescription.find({ patient: userId })
      .populate("doctor", "name")
      .populate("patient", "name")
      .sort({ issuedAt: -1 })
      .limit(10)
      .lean<RxRow[]>(),
    PharmacyOrder.find({ patient: userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean<OrderRow[]>(),
  ]);

  const activeRx = prescriptions.filter((r) => !r.fulfilledAt && !r.revokedAt);
  const ordersByRx = new Map(orders.map((o) => [String(o.prescription), o]));
  const inProgressOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  );
  const next = upcoming[0];

  return (
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader user={{ name: displayName, role: session.user.role }} />
      <PageHeader eyebrow="Your records" title="Welcome back," italic={displayName.split(" ")[0] + "."}>
        Everything you need for your next visit, your prescriptions, and your pharmacy in one place.
      </PageHeader>

      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pb-24">
        <StatGrid cols={3}>
          <StatTile label="Upcoming visits" value={upcoming.length} hint="Scheduled or in progress" />
          <StatTile label="Active prescriptions" value={activeRx.length} hint="Not yet fulfilled" />
          <StatTile label="Pharmacy in progress" value={inProgressOrders.length} hint="Orders being prepared or shipped" />
        </StatGrid>

        {next && <NextConsultationCard appt={next} />}

        <Section
          id="schedule"
          eyebrow="Calendar"
          title="Upcoming appointments"
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

        <Section
          id="prescriptions"
          eyebrow="℞"
          title="Active prescriptions"
          action={
            <Link href="/pharmacy" className="btn btn-ghost text-xs">
              Browse pharmacy →
            </Link>
          }
        >
          {activeRx.length === 0 ? (
            <EmptyState message="No active prescriptions on file." />
          ) : (
            <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
              {activeRx.map((r) => {
                const order = ordersByRx.get(String(r._id));
                return (
                  <li
                    key={r._id}
                    className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {r.drugs.map((d) => d.name).join(", ")}
                      </p>
                      <p className="mono text-[11px] text-ink-mute mt-0.5">
                        {new Date(r.issuedAt).toLocaleDateString()} · Dr. {r.doctor.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/prescriptions/${r._id}/pdf`}
                        target="_blank"
                        className="btn btn-ghost text-xs"
                      >
                        View PDF
                      </a>
                      {order ? (
                        <StatusPill status={order.status} />
                      ) : (
                        <Link href={`/pharmacy/order/${r._id}`} className="btn btn-clay text-xs">
                          Order →
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section eyebrow="Pharmacy" title="Recent orders">
          {orders.length === 0 ? (
            <EmptyState message="No pharmacy orders yet." />
          ) : (
            <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
              {orders.map((o) => (
                <li
                  key={o._id}
                  className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
                >
                  <div>
                    <p className="font-medium">Order {String(o._id).slice(-6).toUpperCase()}</p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusPill status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        {recentAppts.length > 0 && (
          <Section eyebrow="History" title="Past visits">
            <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
              {recentAppts.map((a) => (
                <ApptRowItem key={a._id} appt={a} as="patient" />
              ))}
            </ul>
          </Section>
        )}

        <Section eyebrow="Quick actions" title="Take action">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
            <Link href="/doctors" className="bg-paper p-5 hover:bg-paper-tint transition-colors">
              <p className="font-display text-[1.25rem] tracking-tight">Find a doctor</p>
              <p className="text-ink-soft text-[13px] mt-2">Browse 50+ specialties.</p>
            </Link>
            <Link href="/pharmacy" className="bg-paper p-5 hover:bg-paper-tint transition-colors">
              <p className="font-display text-[1.25rem] tracking-tight">Open pharmacy</p>
              <p className="text-ink-soft text-[13px] mt-2">Order from a verified dispensary.</p>
            </Link>
            <Link href="/#security" className="bg-paper p-5 hover:bg-paper-tint transition-colors">
              <p className="font-display text-[1.25rem] tracking-tight">Privacy &amp; security</p>
              <p className="text-ink-soft text-[13px] mt-2">How your record is protected.</p>
            </Link>
          </div>
        </Section>
      </div>
    </main>
  );
}

function NextConsultationCard({ appt }: { appt: ApptRow }) {
  const startAt = new Date(appt.startAt);
  const inJoinWindow =
    Date.now() >= startAt.getTime() - JOIN_WINDOW_MS &&
    Date.now() <= new Date(appt.endAt).getTime();
  return (
    <div className="mt-12 relative">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 border border-[color:var(--rule-strong)] bg-paper-deep"
      />
      <div className="relative bg-paper border border-[color:var(--rule-strong)]">
        <div className="px-5 py-3.5 border-b border-[color:var(--rule)] flex items-center justify-between">
          <span className="eyebrow">Your next consultation</span>
          <span className="inline-flex items-center gap-1.5 eyebrow text-moss">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            {appt.status === "in_progress" ? "Live" : "Confirmed"}
          </span>
        </div>
        <div className="p-5 flex items-start gap-4 border-b border-[color:var(--rule)]">
          <div className="w-12 h-12 rounded-full bg-clay-wash text-clay font-display text-[18px] flex items-center justify-center">
            {appt.doctor.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[1.25rem] tracking-[-0.015em] leading-tight">
              Dr. {appt.doctor.name}
            </p>
            <p className="eyebrow mt-1">{relativeWhen(startAt)}</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 border-b border-[color:var(--rule)]">
          <div>
            <p className="eyebrow mb-1">Date</p>
            <p className="text-[14px] text-ink">{startAt.toLocaleString()}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Channel</p>
            <p className="text-[14px] text-ink">Encrypted video</p>
          </div>
        </div>
        <div className="p-5 flex items-center justify-between gap-3">
          <span className="mono text-[11px] text-ink-mute">
            APPT-{String(appt._id).slice(-8).toUpperCase()}
          </span>
          <div className="flex gap-2">
            <Link href={`/dashboard#schedule`} className="btn btn-ghost px-3 py-1.5 text-[12px]">
              Reschedule
            </Link>
            {inJoinWindow ? (
              <Link
                href={`/consult/${appt._id}`}
                className="btn btn-clay px-3 py-1.5 text-[12px]"
              >
                Join call →
              </Link>
            ) : (
              <button type="button" disabled className="btn btn-clay px-3 py-1.5 text-[12px] opacity-50 cursor-not-allowed">
                Opens 15 min before
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApptRowItem({ appt, as }: { appt: ApptRow; as: "patient" | "doctor" }) {
  const startAt = new Date(appt.startAt);
  const inJoinWindow =
    Date.now() >= startAt.getTime() - JOIN_WINDOW_MS &&
    Date.now() <= new Date(appt.endAt).getTime() &&
    (appt.status === "scheduled" || appt.status === "in_progress");
  return (
    <li className="px-4 py-3 flex flex-wrap justify-between items-center gap-3">
      <div>
        <p className="font-medium">
          {as === "patient" ? `Dr. ${appt.doctor.name}` : appt.patient.name}
        </p>
        <p className="mono text-[11px] text-ink-mute mt-0.5">
          {startAt.toLocaleString()} · {relativeWhen(startAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={appt.status} />
        {inJoinWindow && (
          <Link href={`/consult/${appt._id}`} className="btn btn-clay text-xs">
            {as === "doctor" ? "Start consult →" : "Join →"}
          </Link>
        )}
        {as === "doctor" && appt.status === "scheduled" && (
          <Link href={`/dashboard/clinician/prescribe/${appt._id}`} className="btn btn-ghost text-xs">
            Issue Rx
          </Link>
        )}
      </div>
    </li>
  );
}

/* ============================================================
   CLINICIAN VIEW
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

  const [profile, todays, week, recentRx, panelIds, rx30Count] = await Promise.all([
    DoctorProfile.findOne({ user: userId })
      .lean<{ specialty: string; licenseVerifiedAt?: Date; consultationFeeCents: number; rating: number; ratingCount: number } | null>(),
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
      .limit(20)
      .lean<ApptRow[]>(),
    Prescription.find({ doctor: userId })
      .populate("patient", "name")
      .populate("doctor", "name")
      .sort({ issuedAt: -1 })
      .limit(10)
      .lean<RxRow[]>(),
    Appointment.distinct("patient", { doctor: userId }),
    Prescription.countDocuments({ doctor: userId, issuedAt: { $gte: last30 } }),
  ]);

  const verified = !!profile?.licenseVerifiedAt;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader user={{ name: displayName, role: session.user.role }} />
      <PageHeader
        eyebrow="Practice"
        title="Good morning,"
        italic={`Dr. ${displayName.split(" ").slice(-1)[0]}.`}
      >
        {profile?.specialty ?? "Clinician"} · {panelIds.length} patients in your panel ·{" "}
        ${(profile?.consultationFeeCents ?? 5000) / 100} per consult
      </PageHeader>

      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pb-24">
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
              <p className={`text-sm ${verified ? "text-moss" : "text-amber"}`}>
                {verified
                  ? `Verified by Vellum on ${new Date(profile.licenseVerifiedAt!).toLocaleDateString()}`
                  : "Pending admin verification — your account is read-only until approved."}
              </p>
            </div>
            <Link href="/dashboard/clinician/profile" className="btn btn-ghost text-xs">
              Manage profile →
            </Link>
          </div>
        )}

        <StatGrid cols={4}>
          <StatTile label="Today's visits" value={todays.length} />
          <StatTile label="This week" value={week.length} hint={`${startOfWeek.toLocaleDateString()} – ${new Date(endOfWeek.getTime() - 1).toLocaleDateString()}`} />
          <StatTile label="Rx issued" value={rx30Count} hint="Last 30 days" />
          <StatTile label="Patients" value={panelIds.length} hint="In your panel" />
        </StatGrid>

        <Section id="schedule" eyebrow="Today" title="Schedule">
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

        <Section id="rx" eyebrow="℞" title="Recent prescriptions">
          {recentRx.length === 0 ? (
            <EmptyState message="No prescriptions issued yet." />
          ) : (
            <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
              {recentRx.map((r) => (
                <li
                  key={r._id}
                  className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {r.patient.name} ·{" "}
                      <span className="text-ink-soft text-[13px]">
                        {r.drugs.map((d) => d.name).join(", ")}
                      </span>
                    </p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5">
                      {new Date(r.issuedAt).toLocaleDateString()}
                      {r.fulfilledAt ? " · fulfilled" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/clinician/prescriptions/${r._id}`}
                    className="btn btn-ghost text-xs"
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </main>
  );
}
