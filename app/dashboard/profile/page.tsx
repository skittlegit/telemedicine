import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { PageHeader, Section } from "@/app/dashboard/_components/Shell";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const session = await requireRole("patient");

  await connectDB();
  const me = await User.findById(session.user.id)
    .lean<{
      _id: string;
      name: string;
      email: string;
      role: string;
      emailVerifiedAt?: Date;
      createdAt?: Date;
    } | null>();

  if (!me) {
    return (
      <>
        <PageHeader eyebrow="Account" title="Profile">
          We couldn&apos;t load your account.
        </PageHeader>
      </>
    );
  }

  const verified = !!me.emailVerifiedAt;

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile">
        Your contact details and account state. Address & insurance editing is
        coming in a later release.
      </PageHeader>

      <Section eyebrow="Identity" title="Contact details">
        <dl className="border border-[color:var(--rule)] divide-y divide-[color:var(--rule)]">
          <Field label="Name" value={me.name} />
          <Field label="Email" value={me.email} />
          <Field
            label="Email verified"
            value={
              verified
                ? `Verified ${new Date(me.emailVerifiedAt!).toLocaleDateString()}`
                : "Not yet verified"
            }
            tone={verified ? "moss" : "amber"}
          />
          <Field label="Role" value={me.role} />
          {me.createdAt && (
            <Field
              label="Member since"
              value={new Date(me.createdAt).toLocaleDateString()}
            />
          )}
        </dl>
      </Section>

      <Section eyebrow="Privacy" title="Your data">
        <p className="text-[14px] text-ink-soft leading-[1.65] max-w-[60ch]">
          Vellum stores your medical record encrypted at rest. You can request
          a full export or account deletion at any time — see{" "}
          <a className="text-clay hover:underline" href="/security#rights">
            Your rights
          </a>{" "}
          for the formal request flow.
        </p>
      </Section>
    </>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "moss" | "amber";
}) {
  const toneCls =
    tone === "moss"
      ? "text-moss"
      : tone === "amber"
        ? "text-amber"
        : "text-ink";
  return (
    <div className="px-4 py-3 grid grid-cols-3 gap-4">
      <dt className="eyebrow self-center">{label}</dt>
      <dd className={`col-span-2 text-[14px] ${toneCls}`}>{value}</dd>
    </div>
  );
}
