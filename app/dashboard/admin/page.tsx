import Link from "next/link";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  StatGrid,
  StatTile,
  Section,
} from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireRole("admin");
  await connectDB();

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pending, doctors, pharmacists, apptsToday, rxToday, ordersOpen, recentAudits] =
    await Promise.all([
      User.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "doctor", status: "active" }),
      User.countDocuments({ role: "pharmacist", status: "active" }),
      Appointment.countDocuments({ createdAt: { $gte: last24h } }),
      Prescription.countDocuments({ issuedAt: { $gte: last24h } }),
      PharmacyOrder.countDocuments({
        status: { $in: ["queued", "claimed", "preparing", "out_for_delivery"] },
      }),
      AuditLog.countDocuments({ createdAt: { $gte: last24h } }),
    ]);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Operations" italic="overview.">
        Approvals, clinician roster, and the audit log.
      </PageHeader>

      <StatGrid cols={4}>
        <StatTile
          label="Pending approvals"
          value={pending}
          hint="Doctors / pharmacists"
        />
        <StatTile label="Active doctors" value={doctors} />
        <StatTile label="Active pharmacists" value={pharmacists} />
        <StatTile label="Open orders" value={ordersOpen} />
      </StatGrid>

      <StatGrid cols={3}>
        <StatTile label="Visits booked (24h)" value={apptsToday} />
        <StatTile label="Rx issued (24h)" value={rxToday} />
        <StatTile label="Audit events (24h)" value={recentAudits} />
      </StatGrid>

      <Section eyebrow="Workspaces" title="Jump to">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AdminTile
            href="/dashboard/admin/approvals"
            label="Approvals"
            hint={`${pending} pending`}
          />
          <AdminTile
            href="/dashboard/admin/clinicians"
            label="Clinicians"
            hint={`${doctors} active`}
          />
          <AdminTile
            href="/dashboard/admin/audit"
            label="Audit log"
            hint="Last 24h activity"
          />
        </div>
      </Section>
    </>
  );
}

function AdminTile({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="block border border-[color:var(--rule)] hover:border-ink p-4 transition-colors"
    >
      <p className="font-medium">{label}</p>
      <p className="mono text-[11px] text-ink-mute mt-1">{hint}</p>
    </Link>
  );
}
