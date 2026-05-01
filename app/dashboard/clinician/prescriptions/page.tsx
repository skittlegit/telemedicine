import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  EmptyState,
  StatGrid,
  StatTile,
} from "@/app/dashboard/_components/Shell";
import type { RxRow } from "@/app/dashboard/_lib/shared";

export const dynamic = "force-dynamic";

export default async function ClinicianPrescriptionsPage() {
  const session = await requireRole("doctor");
  const userId = session.user.id;
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await connectDB();
  const [active, past, count30] = await Promise.all([
    Prescription.find({
      doctor: userId,
      fulfilledAt: { $exists: false },
      revokedAt: { $exists: false },
    })
      .populate("patient", "name")
      .populate("doctor", "name")
      .sort({ issuedAt: -1 })
      .limit(50)
      .lean<RxRow[]>(),
    Prescription.find({
      doctor: userId,
      $or: [
        { fulfilledAt: { $exists: true } },
        { revokedAt: { $exists: true } },
      ],
    })
      .populate("patient", "name")
      .populate("doctor", "name")
      .sort({ issuedAt: -1 })
      .limit(50)
      .lean<RxRow[]>(),
    Prescription.countDocuments({
      doctor: userId,
      issuedAt: { $gte: last30 },
    }),
  ]);

  return (
    <>
      <PageHeader eyebrow="℞" title="Prescriptions">
        Issued by you. Active scripts await fulfilment; history covers fulfilled
        and revoked.
      </PageHeader>

      <StatGrid cols={3}>
        <StatTile label="Active" value={active.length} hint="Awaiting fulfilment" />
        <StatTile label="Issued (30d)" value={count30} />
        <StatTile label="Recent history" value={past.length} hint="Last 50" />
      </StatGrid>

      <Section eyebrow="Active" title="Awaiting fulfilment">
        {active.length === 0 ? (
          <EmptyState message="No active prescriptions." />
        ) : (
          <RxList rows={active} />
        )}
      </Section>

      <Section eyebrow="History" title="Fulfilled & revoked">
        {past.length === 0 ? (
          <EmptyState message="No prescription history yet." />
        ) : (
          <RxList rows={past} />
        )}
      </Section>
    </>
  );
}

function RxList({ rows }: { rows: RxRow[] }) {
  return (
    <ul className="divide-y divide-[color:var(--rule)] border border-[color:var(--rule)]">
      {rows.map((r) => (
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
              {r.revokedAt ? " · revoked" : ""}
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
  );
}
