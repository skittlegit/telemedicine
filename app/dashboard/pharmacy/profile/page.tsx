import { connectDB } from "@/lib/db";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import {
  DashboardHeader,
  PageHeader,
  Section,
} from "@/app/dashboard/_components/Shell";
import { PharmacyProfileForm } from "./PharmacyProfileForm";

export const dynamic = "force-dynamic";

interface ProfileLean {
  pharmacyName: string;
  licenseNumber: string;
  licenseRegion: string;
  licenseVerifiedAt?: Date;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export default async function PharmacyProfilePage() {
  const session = await requireRole("pharmacist");
  await connectDB();
  const profile = await PharmacyProfile.findOne({ user: session.user.id })
    .lean<ProfileLean | null>();

  const verified = !!profile?.licenseVerifiedAt;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <DashboardHeader
        user={{ name: session.user.name ?? "Pharmacist", role: "pharmacist" }}
      />
      <PageHeader eyebrow="Pharmacy" title="Pharmacy" italic="profile.">
        Update licence and dispensary contact details. Changing your licence
        triggers a fresh admin verification.
      </PageHeader>

      <div className="mx-auto w-full max-w-[820px] px-5 sm:px-6 lg:px-8 pb-24">
        <div
          className={`mb-10 border p-4 ${
            verified ? "border-moss/40 bg-moss/5" : "border-amber/40 bg-amber/10"
          }`}
        >
          <p className="eyebrow mb-1">Licensure</p>
          <p className={`text-sm ${verified ? "text-moss" : "text-amber"}`}>
            {verified
              ? `Verified by Vellum on ${new Date(profile!.licenseVerifiedAt!).toLocaleDateString()}.`
              : "Pending admin verification — your account is read-only until approved."}
          </p>
        </div>

        <Section eyebrow="Edit" title="Pharmacy details">
          <PharmacyProfileForm
            initial={{
              pharmacyName: profile?.pharmacyName ?? "",
              licenseNumber: profile?.licenseNumber ?? "",
              licenseRegion: profile?.licenseRegion ?? "",
              addressLine1: profile?.addressLine1 ?? "",
              addressLine2: profile?.addressLine2 ?? "",
              city: profile?.city ?? "",
              region: profile?.region ?? "",
              postalCode: profile?.postalCode ?? "",
              country: profile?.country ?? "",
              phone: profile?.phone ?? "",
            }}
          />
        </Section>
      </div>
    </main>
  );
}
