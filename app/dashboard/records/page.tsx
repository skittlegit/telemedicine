import Link from "next/link";
import { requireRole } from "@/lib/authz";
import { PageHeader, Section, EmptyState } from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

export default async function PatientRecordsPage() {
  await requireRole("patient");

  return (
    <>
      <PageHeader eyebrow="Records" title="Your medical record">
        A consolidated view of your visits, prescriptions, and clinical notes.
      </PageHeader>

      <Section eyebrow="Coming soon" title="Exportable record bundle">
        <EmptyState
          message="We're building a single, encrypted PDF bundle that includes every visit summary, prescription, and lab note on file. In the meantime, you can find each item under Visits and Prescriptions."
          cta={
            <div className="flex gap-2">
              <Link
                href="/dashboard/visits"
                className="btn btn-ghost text-xs"
              >
                See visits →
              </Link>
              <Link
                href="/dashboard/prescriptions"
                className="btn btn-clay text-xs"
              >
                See prescriptions →
              </Link>
            </div>
          }
        />
      </Section>
    </>
  );
}
