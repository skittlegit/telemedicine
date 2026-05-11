import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import { disableUserAction, approveUserAction } from "@/app/actions/admin";
import {
  PageHeader,
  Section,
  EmptyState,
  StatGrid,
  StatTile,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

interface PharmacistRow {
  _id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
}
interface PharmLic {
  user: string;
  pharmacyName: string;
  licenseNumber: string;
  licenseRegion: string;
  city?: string;
}

export default async function PharmaciesAdminPage() {
  await requireRole("admin");
  await connectDB();

  const [active, disabled] = await Promise.all([
    User.find({ role: "pharmacist", status: "active" })
      .sort({ name: 1 })
      .lean<PharmacistRow[]>(),
    User.find({ role: "pharmacist", status: "disabled" })
      .sort({ name: 1 })
      .lean<PharmacistRow[]>(),
  ]);

  const ids = [...active, ...disabled].map((u) => u._id);
  const profiles = ids.length
    ? await PharmacyProfile.find({ user: { $in: ids } })
        .select("user pharmacyName licenseNumber licenseRegion city")
        .lean<PharmLic[]>()
    : [];
  const profMap = new Map(profiles.map((p) => [String(p.user), p]));

  return (
    <>
      <PageHeader eyebrow="Admin · Roster" title="Pharmacies">
        Active and disabled pharmacy accounts.
      </PageHeader>

      <StatGrid cols={3}>
        <StatTile label="Active" value={active.length} />
        <StatTile label="Disabled" value={disabled.length} />
        <StatTile label="Total" value={active.length + disabled.length} />
      </StatGrid>

      <Section eyebrow="Active" title={`${active.length} pharmacies`}>
        {active.length === 0 ? (
          <EmptyState message="No active pharmacies yet." />
        ) : (
          <PharmacyTable rows={active} profMap={profMap} state="active" />
        )}
      </Section>

      {disabled.length > 0 && (
        <Section eyebrow="Disabled" title={`${disabled.length} accounts`}>
          <PharmacyTable rows={disabled} profMap={profMap} state="disabled" />
        </Section>
      )}
    </>
  );
}

function PharmacyTable({
  rows,
  profMap,
  state,
}: {
  rows: PharmacistRow[];
  profMap: Map<string, PharmLic>;
  state: "active" | "disabled";
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
                {p?.pharmacyName ?? u.name}
                {p?.city ? (
                  <span className="text-ink-soft"> · {p.city}</span>
                ) : null}
              </p>
              <p className="mono text-[11px] text-ink-mute mt-0.5">
                {u.email}
                {p
                  ? ` · ${p.licenseNumber} (${p.licenseRegion})`
                  : " · no licence on file"}
              </p>
            </div>
            {state === "active" ? (
              <form action={disableUserAction}>
                <input type="hidden" name="userId" value={u._id} />
                <button type="submit" className="btn btn-ghost text-xs">
                  Disable
                </button>
              </form>
            ) : (
              <form action={approveUserAction}>
                <input type="hidden" name="userId" value={u._id} />
                <button type="submit" className="btn btn-ghost text-xs">
                  Re-enable
                </button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
