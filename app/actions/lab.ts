"use server";

import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { encryptPHI } from "@/lib/crypto";
import { requireRole } from "@/lib/authz";
import { audit } from "@/lib/audit";

export interface LabRequest {
  test: string;
  notes?: string;
}

export type LabState = { error?: string; ok?: boolean };

export async function saveLabRequestsAction(
  _prev: LabState,
  formData: FormData,
): Promise<LabState> {
  const session = await requireRole("doctor");

  const appointmentId = String(formData.get("appointmentId") ?? "");
  if (!Types.ObjectId.isValid(appointmentId)) {
    return { error: "Invalid appointment." };
  }

  let labRequests: LabRequest[];
  try {
    labRequests = JSON.parse(String(formData.get("labRequests") ?? "[]"));
  } catch {
    return { error: "Invalid lab request data." };
  }

  if (!Array.isArray(labRequests) || labRequests.length === 0) {
    return { error: "Add at least one lab test." };
  }

  for (const r of labRequests) {
    if (!r.test || typeof r.test !== "string" || !r.test.trim()) {
      return { error: "Each lab order must have a test name." };
    }
  }

  await connectDB();

  const appt = await Appointment.findById(appointmentId).lean<{
    _id: Types.ObjectId;
    doctor: Types.ObjectId;
  } | null>();

  if (!appt) return { error: "Appointment not found." };
  if (String(appt.doctor) !== session.user.id) return { error: "Not your appointment." };

  const cleaned = labRequests.map((r) => ({
    test: r.test.trim(),
    ...(r.notes?.trim() ? { notes: r.notes.trim() } : {}),
  }));

  await Appointment.findByIdAndUpdate(appointmentId, {
    labRequestsEnc: encryptPHI(JSON.stringify(cleaned)),
  });

  await audit({
    actor: session.user.id,
    actorRole: "doctor",
    action: "lab.create",
    target: `Appointment:${appointmentId}`,
    meta: { count: cleaned.length },
  });

  return { ok: true };
}
