"use server";

import { redirect } from "next/navigation";
import { Types } from "mongoose";
import QRCode from "qrcode";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { Prescription } from "@/lib/models/Prescription";
import { encryptPHI, signPrescription, token } from "@/lib/crypto";
import { requireRole } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { PrescriptionSchema } from "@/lib/schemas";
import { env } from "@/lib/env";

export type RxFormState = { error?: string; ok?: boolean };

export async function issuePrescriptionAction(
  _prev: RxFormState,
  formData: FormData,
): Promise<RxFormState> {
  const session = await requireRole("doctor");

  // Form encodes drugs as JSON in a hidden field for simplicity.
  let drugs: unknown;
  try {
    drugs = JSON.parse(String(formData.get("drugs") ?? "[]"));
  } catch {
    return { error: "Invalid drug list." };
  }

  const parsed = PrescriptionSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    diagnosis: formData.get("diagnosis"),
    drugs,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid prescription." };
  }
  if (!Types.ObjectId.isValid(parsed.data.appointmentId)) {
    return { error: "Invalid appointment." };
  }

  await connectDB();

  const appt = await Appointment.findById(parsed.data.appointmentId).lean<{
    _id: Types.ObjectId;
    doctor: Types.ObjectId;
    patient: Types.ObjectId;
    status: string;
  } | null>();
  if (!appt) return { error: "Appointment not found." };
  if (String(appt.doctor) !== session.user.id) {
    return { error: "Not your appointment." };
  }

  const issuedAt = Date.now();
  const verifyToken = token(16);
  const id = new Types.ObjectId();

  const signature = signPrescription({
    id: String(id),
    doctorId: String(appt.doctor),
    patientId: String(appt.patient),
    issuedAt,
    drugs: parsed.data.drugs,
  });

  await Prescription.create({
    _id: id,
    appointment: appt._id,
    doctor: appt.doctor,
    patient: appt.patient,
    drugs: parsed.data.drugs,
    diagnosisEnc: encryptPHI(parsed.data.diagnosis) ?? undefined,
    issuedAt: new Date(issuedAt),
    signature,
    verifyToken,
  } as unknown as Parameters<typeof Prescription.create>[0]);

  await audit({
    actor: session.user.id,
    actorRole: "doctor",
    action: "prescription.create",
    target: `Prescription:${id}`,
    meta: { drugCount: parsed.data.drugs.length },
  });

  redirect(`/dashboard/clinician/prescriptions/${id}`);
}

/** Generate a QR code data URL for the public verify link. */
export async function prescriptionQrDataUrl(verifyToken: string): Promise<string> {
  const url = `${env.APP_URL}/verify/${verifyToken}`;
  return QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, scale: 6 });
}
