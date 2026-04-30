import Link from "next/link";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/authz";
import {
  approveUserAction,
  disableUserAction,
} from "@/app/actions/admin";
import { signOutAction } from "@/app/actions/auth";

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
}
interface AuditRow {
  _id: string;
  action: string;
  actor?: string;
  actorRole?: string;
  target?: string;
  createdAt: Date;
}

export default async function AdminDashboard() {
  const session = await requireRole("admin");
  await connectDB();

  const [pending, activeDoctors, profiles, audits, counts] = await Promise.all([
    User.find({ role: { $in: ["doctor", "pharmacist"] }, status: "pending" })
      .sort({ createdAt: 1 })
      .lean<UserRow[]>(),
    User.find({ role: "doctor", status: "active" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean<UserRow[]>(),
    DoctorProfile.find().lean<DoctorRow[]>(),
    AuditLog.find().sort({ createdAt: -1 }).limit(30).lean<AuditRow[]>(),
    Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor", status: "active" }),
      User.countDocuments({ role: "pharmacist", status: "active" }),
    ]),
  ]);

  const profilesByUser = new Map(profiles.map((p) => [String(p.user), p]));

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-[color:var(--rule-strong)]">
        <div className="mx-auto w-full max-w-[1100px] px-8 py-6 flex items-baseline justify-between">
          <Link href="/" className="eyebrow text-ink-mute hover:text-clay">
            ← Vellum Health
          </Link>
          <div className="flex items-center gap-4 eyebrow">
            <span>{session.user.name} · admin</span>
            <form action={signOutAction}>
              <button type="submit" className="hover:text-clay">Sign out</button>
            </form>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1100px] px-8 pb-8">
          <p className="eyebrow">Operations</p>
          <h1 className="font-display text-6xl tracking-tight mt-2">Admin</h1>
          <p className="text-ink-soft mt-2">
            {counts[0]} patients · {counts[1]} active doctors · {counts[2]} pharmacists
          </p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1100px] px-8 py-10 grid gap-12">
        {/* Pending licensure approvals */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-3xl">Pending approvals</h2>
            <span className="eyebrow text-ink-mute">{pending.length} awaiting</span>
          </div>
          {pending.length === 0 ? (
            <p className="text-ink-mute italic text-sm">
              No pending clinician or pharmacist accounts.
            </p>
          ) : (
            <ul className="space-y-3">
              {pending.map((u) => {
                const profile = profilesByUser.get(String(u._id));
                return (
                  <li
                    key={u._id}
                    className="border border-[color:var(--rule-strong)] p-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="mono text-xs text-ink-mute">
                          {u.email} · {u.role} · joined{" "}
                          {new Date(u.createdAt).toLocaleDateString()}
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
                    {profile && (
                      <div className="mt-3 text-sm text-ink-soft">
                        <p>
                          <span className="eyebrow mr-2">specialty</span>
                          {profile.specialty}
                        </p>
                        <p>
                          <span className="eyebrow mr-2">licence</span>
                          {profile.licenseNumber} ({profile.licenseRegion})
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Active doctors (with disable) */}
        <div>
          <h2 className="font-display text-3xl mb-4">Active doctors</h2>
          {activeDoctors.length === 0 ? (
            <p className="text-ink-mute italic text-sm">No active doctors yet.</p>
          ) : (
            <ul className="space-y-2">
              {activeDoctors.map((u) => (
                <li
                  key={u._id}
                  className="border border-[color:var(--rule)] p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">Dr. {u.name}</p>
                    <p className="mono text-xs text-ink-mute">{u.email}</p>
                  </div>
                  <form action={disableUserAction}>
                    <input type="hidden" name="userId" value={u._id} />
                    <button type="submit" className="btn btn-ghost text-xs">
                      Disable
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Audit log */}
        <div>
          <h2 className="font-display text-3xl mb-4">Audit log</h2>
          {audits.length === 0 ? (
            <p className="text-ink-mute italic text-sm">No events yet.</p>
          ) : (
            <ul className="space-y-1 mono text-xs">
              {audits.map((a) => (
                <li
                  key={a._id}
                  className="border-b border-[color:var(--rule)] py-1.5 flex gap-3"
                >
                  <span className="text-ink-mute shrink-0 w-32">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                  <span className="font-medium shrink-0 w-44">{a.action}</span>
                  <span className="text-ink-soft truncate">
                    {a.actorRole ?? "system"}
                    {a.target ? ` → ${a.target}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
