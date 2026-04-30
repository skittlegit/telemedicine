"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import { audit } from "@/lib/audit";
import {
  DoctorProfileUpdateSchema,
  PharmacyProfileUpdateSchema,
} from "@/lib/schemas";

export type ProfileFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateDoctorProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireRole("doctor");
  const parsed = DoctorProfileUpdateSchema.safeParse({
    specialty: formData.get("specialty"),
    bio: formData.get("bio"),
    licenseNumber: formData.get("licenseNumber"),
    licenseRegion: formData.get("licenseRegion"),
    yearsOfExperience: formData.get("yearsOfExperience") || 0,
    languages: formData.get("languages") || "",
    consultationFeeCents: formData.get("consultationFeeCents") || 5000,
  });
  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await connectDB();
    const languages = parsed.data.languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    // Re-licensing requires admin re-verification.
    const existing = await DoctorProfile.findOne({ user: session.user.id })
      .select("licenseNumber licenseRegion")
      .lean<{ licenseNumber: string; licenseRegion: string } | null>();
    const licenceChanged =
      !!existing &&
      (existing.licenseNumber !== parsed.data.licenseNumber ||
        existing.licenseRegion !== parsed.data.licenseRegion);
    const update: Record<string, unknown> = {
      specialty: parsed.data.specialty,
      bio: parsed.data.bio,
      licenseNumber: parsed.data.licenseNumber,
      licenseRegion: parsed.data.licenseRegion,
      yearsOfExperience: parsed.data.yearsOfExperience,
      languages,
      consultationFeeCents: parsed.data.consultationFeeCents,
    };
    if (licenceChanged) update.licenseVerifiedAt = null;

    await DoctorProfile.updateOne(
      { user: session.user.id },
      { $set: update },
      { upsert: true },
    );
    await audit({
      actor: session.user.id,
      actorRole: "doctor",
      action: "doctor.profile.update",
      target: `User:${session.user.id}`,
      meta: { licenceChanged },
    });
  } catch (err) {
    console.error("[updateDoctorProfileAction] failed:", err);
    return { error: "Could not save your profile right now." };
  }

  revalidatePath("/dashboard/clinician/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updatePharmacyProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireRole("pharmacist");
  const parsed = PharmacyProfileUpdateSchema.safeParse({
    pharmacyName: formData.get("pharmacyName"),
    licenseNumber: formData.get("licenseNumber"),
    licenseRegion: formData.get("licenseRegion"),
    addressLine1: formData.get("addressLine1") ?? "",
    addressLine2: formData.get("addressLine2") ?? "",
    city: formData.get("city") ?? "",
    region: formData.get("region") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    country: formData.get("country") ?? "",
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await connectDB();
    const existing = await PharmacyProfile.findOne({ user: session.user.id })
      .select("licenseNumber licenseRegion")
      .lean<{ licenseNumber: string; licenseRegion: string } | null>();
    const licenceChanged =
      !!existing &&
      (existing.licenseNumber !== parsed.data.licenseNumber ||
        existing.licenseRegion !== parsed.data.licenseRegion);

    const update: Record<string, unknown> = { ...parsed.data };
    if (licenceChanged) update.licenseVerifiedAt = null;

    await PharmacyProfile.updateOne(
      { user: session.user.id },
      { $set: update },
      { upsert: true },
    );
    await audit({
      actor: session.user.id,
      actorRole: "pharmacist",
      action: "pharmacist.profile.update",
      target: `User:${session.user.id}`,
      meta: { licenceChanged },
    });
  } catch (err) {
    console.error("[updatePharmacyProfileAction] failed:", err);
    return { error: "Could not save your profile right now." };
  }

  revalidatePath("/dashboard/pharmacy/profile");
  revalidatePath("/dashboard/pharmacy");
  return { ok: true };
}
