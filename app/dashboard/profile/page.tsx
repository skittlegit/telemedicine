import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { PatientProfile } from "@/lib/models/PatientProfile";
import { requireRole } from "@/lib/authz";
import { decryptPHI } from "@/lib/crypto";
import { PageHeader, Section, SignOutSection } from "@/app/dashboard/_components/Shell";
import {
  PatientProfileForm,
  type PatientFormInitial,
} from "./PatientProfileForm";

export const dynamic = "force-dynamic";

interface AddressShape {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

function safeParseAddress(json: string | null): AddressShape {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === "object") return parsed as AddressShape;
  } catch {
    // ignore
  }
  return {};
}

export default async function PatientProfilePage() {
  const session = await requireRole("patient");

  await connectDB();
  const me = await User.findById(session.user.id).lean<{
    _id: string;
    name: string;
    email: string;
    role: string;
    emailVerifiedAt?: Date;
    createdAt?: Date;
  } | null>();

  if (!me) {
    return (
      <PageHeader eyebrow="Account" title="Profile">
        We couldn&apos;t load your account.
      </PageHeader>
    );
  }

  const profile = await PatientProfile.findOne({ user: session.user.id }).lean<{
    dobEnc?: string | null;
    sex?: "male" | "female" | "other" | "unspecified";
    phoneEnc?: string | null;
    addressEnc?: string | null;
    allergiesEnc?: string | null;
    conditionsEnc?: string | null;
    medicationsEnc?: string | null;
    insuranceEnc?: string | null;
    emergencyContactEnc?: string | null;
  } | null>();

  const address = safeParseAddress(decryptPHI(profile?.addressEnc));

  const initial: PatientFormInitial = {
    dob: decryptPHI(profile?.dobEnc) ?? "",
    sex: profile?.sex ?? "unspecified",
    phone: decryptPHI(profile?.phoneEnc) ?? "",
    addressLine1: address.line1 ?? "",
    addressLine2: address.line2 ?? "",
    city: address.city ?? "",
    region: address.region ?? "",
    postalCode: address.postalCode ?? "",
    country: address.country ?? "",
    allergies: decryptPHI(profile?.allergiesEnc) ?? "",
    conditions: decryptPHI(profile?.conditionsEnc) ?? "",
    medications: decryptPHI(profile?.medicationsEnc) ?? "",
    insurance: decryptPHI(profile?.insuranceEnc) ?? "",
    emergencyContact: decryptPHI(profile?.emergencyContactEnc) ?? "",
  };

  const verified = !!me.emailVerifiedAt;

  return (
    <>
      <PageHeader eyebrow="Account" title="Your profile">
        Contact details, medical history, and insurance — all encrypted at
        rest. Visible only to clinicians involved in your care.
      </PageHeader>

      <Section eyebrow="Identity" title="Account">
        <dl className="border border-[color:var(--rule)] divide-y divide-[color:var(--rule)]">
          <Row label="Name" value={me.name} />
          <Row label="Email" value={me.email} />
          <Row
            label="Email verified"
            value={
              verified
                ? `Verified ${new Date(me.emailVerifiedAt!).toLocaleDateString()}`
                : "Not yet verified"
            }
            tone={verified ? "moss" : "amber"}
          />
          {me.createdAt && (
            <Row
              label="Member since"
              value={new Date(me.createdAt).toLocaleDateString()}
            />
          )}
        </dl>
      </Section>

      <Section eyebrow="Edit" title="Personal & medical details">
        <PatientProfileForm initial={initial} />
      </Section>

      <Section eyebrow="Privacy" title="Your data">
        <p className="text-[14px] text-ink-soft leading-[1.65] max-w-[60ch]">
          Vellum stores your medical record encrypted at rest. You can
          request a full export or account deletion at any time. Use the
          channels in your registration confirmation email to file a
          formal request; the team responds within five business days.
        </p>
      </Section>

      <SignOutSection />
    </>
  );
}

function Row({
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
