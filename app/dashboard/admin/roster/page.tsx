import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
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

interface UserRow {
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
interface PharmLic {
  user: string;
  pharmacyName: string;
  licenseNumber: string;
  licenseRegion: string;
  city?: string;
}

export default async function RosterPage() {
  await requireRole("admin");
  await connectDB();

  const [activeDocs, disabledDocs, activePharms, disabledPharms] = await Promise.all([
    User.find({ role: "doctor", status: "active" }).sort({ name: 1 }).lean<UserRow[]>(),
    User.find({ role: "doctor", status: "disabled" }).sort({ name: 1 }).lean<UserRow[]>(),
    User.find({ role: "pharmacist", status: "active" }).sort({ name: 1 }).lean<UserRow[]>(),
    User.find({ role: "pharmacist", status: "disabled" }).sort({ name: 1 }).lean<UserRow[]>(),
  ]);

  const docIds = [...activeDocs, ...disabledDocs].map((u) => u._id);
  const pharmIds = [...activePharms, ...disabledPharms].map((u) => u._id);

  const [docProfiles, pharmProfiles] = await Promise.all([
    docIds.length
      ? DoctorProfile.find({ user: { $in: docIds } })
          .select("user licenseNumber licenseRegion specialty")
          .lean<DoctorLic[]>()
      : [],
    pharmIds.length
      ? PharmacyProfile.find({ user: { $in: pharmIds } })
          .select("user pharmacyName licenseNumber licenseRegion city")
          .lean<PharmLic[]>()
      : [],
  ]);

  const docMap = new Map(docProfiles.map((p) => [String(p.user), p]));
  const pharmMap = new Map(pharmProfiles.map((p) => [String(p.user), p]));

  return (
    <>
      <PageHeader eyebrow="Admin · Roster" title="Roster">
        Clinicians and pharmacies on the platform.
      </PageHeader>

      <StatGrid cols={4}>
        <StatTile label="Active doctors" value={activeDocs.length} />
        <StatTile label="Active pharmacies" value={activePharms.length} />
        <StatTile label="Disabled doctors" value={disabledDocs.length} />
        <StatTile label="Disabled pharmacies" value={disabledPharms.length} />
      </StatGrid>

      {/* ── Clinicians ── */}
      <Section eyebrow="Clinicians" title={`${activeDocs.length} active doctors`}>
        {activeDocs.length === 0 ? (
          <EmptyState message="No active clinicians yet." />
        ) : (
          <RosterTable
            rows={activeDocs}
            getLabel={(u) => {
              const p = docMap.get(String(u._id));
              return {
                name: u.name,
                sub: p?.specialty ?? null,
                meta: p ? `${p.licenseNumber} (${p.licenseRegion})` : "no licence on file",
              };
            }}
            state="active"
          />
        )}
      </Section>

      {disabledDocs.length > 0 && (
        <Section eyebrow="Clinicians · Disabled" title={`${disabledDocs.length} disabled`}>
          <RosterTable
            rows={disabledDocs}
            getLabel={(u) => {
              const p = docMap.get(String(u._id));
              return {
                name: u.name,
                sub: p?.specialty ?? null,
                meta: p ? `${p.licenseNumber} (${p.licenseRegion})` : "no licence on file",
              };
            }}
            state="disabled"
          />
        </Section>
      )}

      {/* ── Pharmacies ── */}
      <Section eyebrow="Pharmacies" title={`${activePharms.length} active pharmacies`}>
        {activePharms.length === 0 ? (
          <EmptyState message="No active pharmacies yet." />
        ) : (
          <RosterTable
            rows={activePharms}
            getLabel={(u) => {
              const p = pharmMap.get(String(u._id));
              return {
                name: p?.pharmacyName ?? u.name,
                sub: p?.city ?? null,
                meta: p ? `${p.licenseNumber} (${p.licenseRegion})` : "no licence on file",
              };
            }}
            state="active"
          />
        )}
      </Section>

      {disabledPharms.length > 0 && (
        <Section eyebrow="Pharmacies · Disabled" title={`${disabledPharms.length} disabled`}>
          <RosterTable
            rows={disabledPharms}
            getLabel={(u) => {
              const p = pharmMap.get(String(u._id));
              return {
                name: p?.pharmacyName ?? u.name,
                sub: p?.city ?? null,
                meta: p ? `${p.licenseNumber} (${p.licenseRegion})` : "no licence on file",
              };
            }}
            state="disabled"
          />
        </Section>
      )}
    </>
  );
}

function RosterTable({
  rows,
  getLabel,
  state,
}: {
  rows: UserRow[];
  getLabel: (u: UserRow) => { name: string; sub: string | null; meta: string };
  state: "active" | "disabled";
}) {
  return (
    <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
      {rows.map((u) => {
        const { name, sub, meta } = getLabel(u);
        return (
          <li key={u._id} className="px-4 py-3 flex flex-wrap justify-between items-center gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">
                {name}
                {sub ? <span className="text-ink-soft"> · {sub}</span> : null}
              </p>
              <p className="mono text-[11px] text-ink-mute mt-0.5">
                {u.email} · {meta}
              </p>
            </div>
            {state === "active" ? (
              <form action={disableUserAction}>
                <input type="hidden" name="userId" value={u._id} />
                <button type="submit" className="btn btn-ghost text-xs">Disable</button>
              </form>
            ) : (
              <form action={approveUserAction}>
                <input type="hidden" name="userId" value={u._id} />
                <button type="submit" className="btn btn-ghost text-xs">Re-enable</button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
