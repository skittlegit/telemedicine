"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireRole } from "@/lib/authz";
import { audit } from "@/lib/audit";

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

  if (updated) {
    await audit({
      actor: session.user.id,
      actorRole: "admin",
      action: `admin.user.${status}`,
      target: `User:${userId}`,
      meta: { email: updated.email, role: updated.role },
    });
  }
  revalidatePath("/dashboard/admin");
}

export async function approveUserAction(formData: FormData) {
  await setUserStatus(formData, "active");
}

export async function disableUserAction(formData: FormData) {
  await setUserStatus(formData, "disabled");
}
