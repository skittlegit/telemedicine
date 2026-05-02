import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import { approveUserAction, disableUserAction } from "@/app/actions/admin";
import {
  PageHeader,
  Section,
  EmptyState,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface DoctorLicense {
  user: string;
  licenseNumber: string;
  licenseRegion: string;
}
interface PharmacyLicense {
  user: string;
  licenseNumber: string;
  licenseRegion: string;
  pharmacyName: string;
}

export default async function ApprovalsPage() {
  await requireRole("admin");
  await connectDB();

  const pending = await User.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .lean<PendingUser[]>();

  const doctorIds = pending.filter((u) => u.role === "doctor").map((u) => u._id);
  const pharmIds = pending.filter((u) => u.role === "pharmacist").map((u) => u._id);

  const [docLicenses, pharmLicenses] = await Promise.all([
    doctorIds.length
      ? DoctorProfile.find({ user: { $in: doctorIds } })
          .select("user licenseNumber licenseRegion")
          .lean<DoctorLicense[]>()
      : Promise.resolve([]),
    pharmIds.length
      ? PharmacyProfile.find({ user: { $in: pharmIds } })
          .select("user licenseNumber licenseRegion pharmacyName")
          .lean<PharmacyLicense[]>()
      : Promise.resolve([]),
  ]);

  const docMap = new Map(docLicenses.map((d) => [String(d.user), d]));
  const pharmMap = new Map(pharmLicenses.map((p) => [String(p.user), p]));

  return (
    <>
      <PageHeader eyebrow="Admin · Approvals" title="Pending users">
        Review licensure and approve or reject new clinician/pharmacist
        applications.
      </PageHeader>

      <Section eyebrow="Queue" title={`${pending.length} pending`}>
        {pending.length === 0 ? (
          <EmptyState message="Nothing pending. Inbox clear." />
        ) : (
          <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
            {pending.map((u) => {
              const lic =
                u.role === "doctor"
                  ? docMap.get(String(u._id))
                  : u.role === "pharmacist"
                    ? pharmMap.get(String(u._id))
                    : undefined;
              const pharmName =
                u.role === "pharmacist"
                  ? (lic as PharmacyLicense | undefined)?.pharmacyName
                  : undefined;
              return (
                <li
                  key={u._id}
                  className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {u.name}
                      {pharmName ? (
                        <span className="text-ink-soft"> · {pharmName}</span>
                      ) : null}
                    </p>
                    <p className="mono text-[11px] text-ink-mute mt-0.5">
                      {u.email} · {u.role} ·{" "}
                      {lic
                        ? `licence ${lic.licenseNumber} (${lic.licenseRegion})`
                        : "no licence on file"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={approveUserAction}>
                      <input type="hidden" name="userId" value={u._id} />
                      <button type="submit" className="btn btn-clay text-xs">
                        Approve
                      </button>
                    </form>
                    <form action={disableUserAction}>
                      <input type="hidden" name="userId" value={u._id} />
                      <button type="submit" className="btn btn-ghost text-xs">
                        Reject
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}
