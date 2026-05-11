import Link from "next/link";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/authz";
import { paymentsEnabled } from "@/lib/settings";
import {
  PageHeader,
  StatGrid,
  StatTile,
  Section,
  SignOutSection,
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

  const payEnabled = await paymentsEnabled();

  return (
    <>
      <PageHeader eyebrow="Admin" title="Operations" italic="overview.">
        Approvals, clinician roster, and the audit log. Snapshot of activity
        across the platform.
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

      <div className="my-12 heartbeat-rule" aria-hidden />

      <Section eyebrow="Last 24 hours" title="Platform activity">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[color:var(--rule)] border-y border-[color:var(--rule-strong)]">
          <Stat label="Visits booked" value={apptsToday} />
          <Stat label="Prescriptions issued" value={rxToday} />
          <Stat label="Audit events" value={recentAudits} />
        </dl>
      </Section>

      <Section eyebrow="Workspaces" title="Jump to">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <AdminTile
            href="/dashboard/admin/approvals"
            label="Approvals"
            hint={`${pending} pending`}
          />
          <AdminTile
            href="/dashboard/admin/roster"
            label="Roster"
            hint={`${doctors + pharmacists} accounts`}
          />
          <AdminTile
            href="/dashboard/admin/audit"
            label="Audit log"
            hint="Last 24h activity"
          />
          <AdminTile
            href="/dashboard/admin/settings"
            label="Settings"
            hint={`Payments ${payEnabled ? "ON" : "OFF"}`}
          />
        </div>
      </Section>

      <SignOutSection />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-paper px-4 py-5">
      <dt className="eyebrow text-ink-mute text-[10px]">{label}</dt>
      <dd className="serif-section text-[28px] tabular mt-1.5 text-ink leading-none">
        {value}
      </dd>
    </div>
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
