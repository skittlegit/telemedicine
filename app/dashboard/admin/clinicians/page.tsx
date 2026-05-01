import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { requireRole } from "@/lib/authz";
import { disableUserAction } from "@/app/actions/admin";
import {
  PageHeader,
  Section,
  EmptyState,
  StatGrid,
  StatTile,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface ClinicianRow {
  _id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
}
interface DoctorLic {
  user: string;
  licenseNumber: string;
  licenseRegion: string;
  specialty?: string;
}

export default async function CliniciansPage() {
  await requireRole("admin");
  await connectDB();

  const [active, disabled] = await Promise.all([
    User.find({ role: "doctor", status: "active" })
      .sort({ name: 1 })
      .lean<ClinicianRow[]>(),
    User.find({ role: "doctor", status: "disabled" })
      .sort({ name: 1 })
      .lean<ClinicianRow[]>(),
  ]);

  const ids = [...active, ...disabled].map((u) => u._id);
  const profiles = ids.length
    ? await DoctorProfile.find({ user: { $in: ids } })
        .select("user licenseNumber licenseRegion specialty")
        .lean<DoctorLic[]>()
    : [];
  const profMap = new Map(profiles.map((p) => [String(p.user), p]));

  return (
    <>
      <PageHeader eyebrow="Admin · Roster" title="Clinicians">
        Active and disabled doctor accounts.
      </PageHeader>

      <StatGrid cols={3}>
        <StatTile label="Active" value={active.length} />
        <StatTile label="Disabled" value={disabled.length} />
        <StatTile label="Total" value={active.length + disabled.length} />
      </StatGrid>

      <Section eyebrow="Active" title={`${active.length} doctors`}>
        {active.length === 0 ? (
          <EmptyState message="No active clinicians yet." />
        ) : (
          <ClinicianTable rows={active} profMap={profMap} canDisable />
        )}
      </Section>

      {disabled.length > 0 && (
        <Section eyebrow="Disabled" title={`${disabled.length} accounts`}>
          <ClinicianTable rows={disabled} profMap={profMap} canDisable={false} />
        </Section>
      )}
    </>
  );
}

function ClinicianTable({
  rows,
  profMap,
  canDisable,
}: {
  rows: ClinicianRow[];
  profMap: Map<string, DoctorLic>;
  canDisable: boolean;
}) {
  return (
    <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
      {rows.map((u) => {
        const p = profMap.get(String(u._id));
        return (
          <li
            key={u._id}
            className="px-4 py-3 flex flex-wrap justify-between items-center gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">
                {u.name}
                {p?.specialty ? (
                  <span className="text-ink-soft"> · {p.specialty}</span>
                ) : null}
              </p>
              <p className="mono text-[11px] text-ink-mute mt-0.5">
                {u.email}
                {p
                  ? ` · ${p.licenseNumber} (${p.licenseRegion})`
                  : " · no licence on file"}
              </p>
            </div>
            {canDisable ? (
              <form action={disableUserAction}>
                <input type="hidden" name="userId" value={u._id} />
                <button type="submit" className="btn btn-ghost text-xs">
                  Disable
                </button>
              </form>
            ) : (
              <span className="mono text-[11px] text-ink-mute">disabled</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
