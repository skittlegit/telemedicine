import Link from "next/link";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/authz";
import {
  approveUserAction,
  disableUserAction,
} from "@/app/actions/admin";
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

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}
interface DoctorRow {
  _id: string;
  user: string;
  specialty: string;
  licenseNumber: string;
  licenseRegion: string;
  licenseVerifiedAt?: Date;
  consultationFeeCents: number;
  rating: number;
  ratingCount: number;
}
interface PharmacyRow {
  _id: string;
  user: string;
  pharmacyName: string;
  licenseNumber: string;
  licenseRegion: string;
  licenseVerifiedAt?: Date;
}
interface AuditRow {
  _id: string;
  action: string;
  actor?: string;
  actorRole?: string;
  target?: string;
  createdAt: Date;
}

function daysAgo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(ms / day);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default async function AdminDashboard() {
  const session = await requireRole("admin");
  await connectDB();

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    pending,
    activeDoctors,
    docProfiles,
    pharmProfiles,
    audits,
    counts,
    recentActivityCount,
  ] = await Promise.all([
    User.find({ role: { $in: ["doctor", "pharmacist"] }, status: "pending" })
      .sort({ createdAt: 1 })
      .lean<UserRow[]>(),
    User.find({ role: "doctor", status: "active" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean<UserRow[]>(),
    DoctorProfile.find().lean<DoctorRow[]>(),
    PharmacyProfile.find().lean<PharmacyRow[]>(),
    AuditLog.find().sort({ createdAt: -1 }).limit(40).lean<AuditRow[]>(),
    Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor", status: "active" }),
      User.countDocuments({ role: "pharmacist", status: "active" }),
    ]),
    AuditLog.countDocuments({ createdAt: { $gte: last24h } }),
  ]);

  const docByUser = new Map(docProfiles.map((p) => [String(p.user), p]));
  const pharmByUser = new Map(pharmProfiles.map((p) => [String(p.user), p]));

  return (
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader user={{ name: session.user.name ?? "Admin", role: "admin" }} />
      <PageHeader eyebrow="Operations" title="Admin" italic="console.">
        Approve clinicians, monitor the queue, audit every privileged action.
      </PageHeader>

      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8 pb-24">
        <StatGrid cols={5}>
          <StatTile label="Patients" value={counts[0]} />
          <StatTile label="Active doctors" value={counts[1]} />
          <StatTile label="Pending approvals" value={pending.length} hint="Doctors & pharmacists" />
          <StatTile label="Pharmacists" value={counts[2]} />
          <StatTile label="Audit events" value={recentActivityCount} hint="Last 24 hours" />
        </StatGrid>

        <Section
          id="approvals"
          eyebrow="Queue"
          title="Pending approvals"
          action={<span className="eyebrow text-ink-mute">{pending.length} awaiting</span>}
        >
          {pending.length === 0 ? (
            <EmptyState message="No pending clinician or pharmacist accounts." />
          ) : (
            <ul className="space-y-3">
              {pending.map((u) => {
                const doc = docByUser.get(String(u._id));
                const pharm = pharmByUser.get(String(u._id));
                return (
                  <li
                    key={u._id}
                    className="border border-[color:var(--rule-strong)] p-5 bg-paper-tint"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-[1.25rem] tracking-tight">
                          {u.name}
                        </p>
                        <p className="mono text-[12px] text-ink-mute mt-0.5">
                          {u.email} · {u.role} · applied {daysAgo(new Date(u.createdAt))}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <form action={approveUserAction}>
                          <input type="hidden" name="userId" value={u._id} />
                          <button type="submit" className="btn btn-clay text-xs">
                            Approve →
                          </button>
                        </form>
                        <form action={disableUserAction}>
                          <input type="hidden" name="userId" value={u._id} />
                          <button type="submit" className="btn btn-ghost text-xs">
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                    {doc && (
                      <dl className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
                        <div className="bg-paper p-3">
                          <dt className="eyebrow mb-1">Specialty</dt>
                          <dd className="text-sm">{doc.specialty}</dd>
                        </div>
                        <div className="bg-paper p-3">
                          <dt className="eyebrow mb-1">Licence #</dt>
                          <dd className="mono text-[12px]">{doc.licenseNumber}</dd>
                        </div>
                        <div className="bg-paper p-3">
                          <dt className="eyebrow mb-1">Region</dt>
                          <dd className="text-sm">{doc.licenseRegion}</dd>
                        </div>
                      </dl>
                    )}
                    {pharm && (
                      <dl className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
                        <div className="bg-paper p-3">
                          <dt className="eyebrow mb-1">Pharmacy</dt>
                          <dd className="text-sm">{pharm.pharmacyName}</dd>
                        </div>
                        <div className="bg-paper p-3">
                          <dt className="eyebrow mb-1">Licence #</dt>
                          <dd className="mono text-[12px]">{pharm.licenseNumber}</dd>
                        </div>
                        <div className="bg-paper p-3">
                          <dt className="eyebrow mb-1">Region</dt>
                          <dd className="text-sm">{pharm.licenseRegion}</dd>
                        </div>
                      </dl>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section
          id="clinicians"
          eyebrow="Roster"
          title="Active clinicians"
          action={<span className="eyebrow text-ink-mute">{activeDoctors.length} on staff</span>}
        >
          {activeDoctors.length === 0 ? (
            <EmptyState message="No active doctors yet." />
          ) : (
            <div className="border border-[color:var(--rule)] overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-paper-tint border-b border-[color:var(--rule)]">
                  <tr className="eyebrow text-left">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Specialty</th>
                    <th className="px-4 py-3">Fee</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--rule)]">
                  {activeDoctors.map((u) => {
                    const p = docByUser.get(String(u._id));
                    return (
                      <tr key={u._id} className="hover:bg-paper-tint">
                        <td className="px-4 py-3">
                          <p className="font-medium">Dr. {u.name}</p>
                          <p className="mono text-[11px] text-ink-mute">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">{p?.specialty ?? "—"}</td>
                        <td className="px-4 py-3 mono">
                          ${((p?.consultationFeeCents ?? 0) / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {p?.licenseVerifiedAt ? (
                            <StatusPill status="active" />
                          ) : (
                            <StatusPill status="pending" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <form action={disableUserAction}>
                            <input type="hidden" name="userId" value={u._id} />
                            <button type="submit" className="btn btn-ghost text-xs">
                              Disable
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section
          id="audit"
          eyebrow="Audit log"
          title="Recent activity"
          action={
            <Link href="/api/health" className="eyebrow hover:text-clay">
              /api/health →
            </Link>
          }
        >
          {audits.length === 0 ? (
            <EmptyState message="No events yet." />
          ) : (
            <div className="border border-[color:var(--rule)] mono text-[12px]">
              <div className="grid grid-cols-[auto_1fr_1fr] gap-px bg-[color:var(--rule)]">
                <div className="bg-paper-tint px-3 py-2 eyebrow">Time</div>
                <div className="bg-paper-tint px-3 py-2 eyebrow">Action</div>
                <div className="bg-paper-tint px-3 py-2 eyebrow">Subject</div>
                {audits.map((a) => (
                  <div key={a._id} className="contents">
                    <div className="bg-paper px-3 py-2 text-ink-mute whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                    <div className="bg-paper px-3 py-2 text-clay">{a.action}</div>
                    <div className="bg-paper px-3 py-2 text-ink-soft truncate">
                      {a.actorRole ?? "system"}
                      {a.target ? ` → ${a.target}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>
    </main>
  );
}
