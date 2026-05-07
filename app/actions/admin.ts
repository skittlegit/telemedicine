"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { requireRole } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { setPaymentsEnabled } from "@/lib/settings";

async function setUserStatus(formData: FormData, status: "active" | "disabled") {
  const session = await requireRole("admin");
  const userId = String(formData.get("userId") ?? "");
  if (!Types.ObjectId.isValid(userId)) return;

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    userId,
    { status },
    { returnDocument: "after" },
  ).lean<{ _id: Types.ObjectId; email: string; role: string } | null>();

  if (!updated) {
    revalidatePath("/dashboard/admin");
    return;
  }

  // Verifying licensure on approval flips a date stamp on the profile so the
  // applicant can show "verified by Vellum" in their own dashboard.
  let licenseVerified = false;
  if (status === "active") {
    if (updated.role === "doctor") {
      const r = await DoctorProfile.updateOne(
        { user: updated._id },
        { $set: { licenseVerifiedAt: new Date() } },
      );
      licenseVerified = r.matchedCount > 0;
    } else if (updated.role === "pharmacist") {
      const r = await PharmacyProfile.updateOne(
        { user: updated._id },
        { $set: { licenseVerifiedAt: new Date() } },
      );
      licenseVerified = r.matchedCount > 0;
    }
  }

  await audit({
    actor: session.user.id,
    actorRole: "admin",
    action: `admin.user.${status}`,
    target: `User:${userId}`,
    meta: { email: updated.email, role: updated.role, licenseVerified },
  });

  revalidatePath("/dashboard/admin");
}

export async function approveUserAction(formData: FormData) {
  await setUserStatus(formData, "active");
}

export async function disableUserAction(formData: FormData) {
  await setUserStatus(formData, "disabled");
}

/**
 * Toggle whether Stripe Checkout is used for bookings & pharmacy orders.
 * When disabled, those flows confirm directly without payment — useful for
 * demos and offline-payment clinics.
 */
export async function setPaymentsEnabledAction(formData: FormData) {
  const session = await requireRole("admin");
  const enabled = formData.get("enabled") === "1";
  await setPaymentsEnabled(enabled, session.user.id);
  await audit({
    actor: session.user.id,
    actorRole: "admin",
    action: enabled ? "admin.settings.payments_enabled" : "admin.settings.payments_disabled",
    target: "Setting:payments.enabled",
  });
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/settings");
}
