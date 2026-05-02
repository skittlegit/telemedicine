import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { requireRole } from "@/lib/authz";
import {
  PageHeader,
  Section,
  LicenseBanner,
  SignOutSection,
} from "@/app/dashboard/_components/Shell";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

interface ProfileLean {
  specialty: string;
  bio: string;
  licenseNumber: string;
  licenseRegion: string;
  licenseVerifiedAt?: Date;
  yearsOfExperience: number;
  languages: string[];
  consultationFeeCents: number;
}

export default async function ClinicianProfilePage() {
  const session = await requireRole("doctor");
  await connectDB();
  const profile = await DoctorProfile.findOne({ user: session.user.id })
    .lean<ProfileLean | null>();

  const verified = !!profile?.licenseVerifiedAt;
  void session;

  return (
    <>
      <PageHeader eyebrow="Practice" title="Your" italic="profile.">
        Update specialty, languages, and rates. Changing your licence will trigger
        a fresh admin verification.
      </PageHeader>

      <div className="max-w-[820px]">
        <LicenseBanner
          verified={verified}
          verifiedAt={profile?.licenseVerifiedAt}
          manageHref="/dashboard/clinician/profile"
        />

        <Section eyebrow="Edit" title="Profile details">
          <ProfileForm
            initial={{
              specialty: profile?.specialty ?? "",
              bio: profile?.bio ?? "",
              licenseNumber: profile?.licenseNumber ?? "",
              licenseRegion: profile?.licenseRegion ?? "",
              yearsOfExperience: profile?.yearsOfExperience ?? 0,
              languages: (profile?.languages ?? []).join(", "),
              consultationFeeCents: profile?.consultationFeeCents ?? 5000,
            }}
          />
        </Section>

        <SignOutSection />
      </div>
    </>
  );
}
