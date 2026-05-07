"use server";

import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Appointment } from "@/lib/models/Appointment";
import { DoctorProfile } from "@/lib/models/DoctorProfile";
import { Payment } from "@/lib/models/Payment";
import { User } from "@/lib/models/User";
import { encryptPHI, token } from "@/lib/crypto";
import { requireRole } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { paymentsEnabled } from "@/lib/settings";
import { env } from "@/lib/env";
import { BookingSchema } from "@/lib/schemas";

export type BookFormState = { error?: string };

export async function bookAppointmentAction(
  _prev: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const session = await requireRole("patient");

  const startRaw = formData.get("startAt");
  // datetime-local lacks tz; treat as local and convert to ISO.
  const iso =
    typeof startRaw === "string" && startRaw.length > 0
      ? new Date(startRaw).toISOString()
      : "";

  const parsed = BookingSchema.safeParse({
    doctorId: formData.get("doctorId"),
    startAt: iso,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: "Please fill in all fields with valid values." };
  }
  if (!Types.ObjectId.isValid(parsed.data.doctorId)) {
    return { error: "Invalid doctor." };
  }

  const startAt = new Date(parsed.data.startAt);
  if (startAt.getTime() < Date.now() + 30 * 60_000) {
    return { error: "Please pick a time at least 30 minutes from now." };
  }

  await connectDB();
  void User;

  const doctorProfile = await DoctorProfile.findById(parsed.data.doctorId)
    .populate("user", "_id status")
    .lean<{
      _id: Types.ObjectId;
      consultationFeeCents: number;
      user: { _id: Types.ObjectId; status: string };
    } | null>();
  if (!doctorProfile || !doctorProfile.user || doctorProfile.user.status !== "active") {
    return { error: "That clinician is not available for booking." };
  }

  const endAt = new Date(startAt.getTime() + 30 * 60_000);

  // Conflict check on the doctor's calendar.
  const conflict = await Appointment.exists({
    doctor: doctorProfile.user._id,
    status: { $in: ["pending_payment", "scheduled", "in_progress"] },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  });
  if (conflict) {
    return { error: "That time slot is no longer available. Pick another." };
  }

  const appt = await Appointment.create({
    patient: session.user.id,
    doctor: doctorProfile.user._id,
    startAt,
    endAt,
    durationMinutes: 30,
    reasonEnc: encryptPHI(parsed.data.reason),
    status: "pending_payment",
    feeCents: doctorProfile.consultationFeeCents,
    roomId: token(12),
  });

  await audit({
    actor: session.user.id,
    actorRole: "patient",
    action: "appointment.create",
    target: `Appointment:${appt._id}`,
    meta: { doctor: String(doctorProfile.user._id), feeCents: doctorProfile.consultationFeeCents },
  });

  // Skip Stripe when not configured OR when admin has disabled payments —
  // auto-confirm the appointment without Checkout.
  if (!isStripeConfigured() || !(await paymentsEnabled())) {
    appt.status = "scheduled";
    await appt.save();
    redirect(`/dashboard?booked=${appt._id}`);
  }

  // Create Stripe Checkout session for the consultation fee.
  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          unit_amount: doctorProfile.consultationFeeCents,
          product_data: { name: "Vellum Health consultation (30 min)" },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.APP_URL}/dashboard?paid=${appt._id}`,
    cancel_url: `${env.APP_URL}/book/${parsed.data.doctorId}?cancelled=1`,
    metadata: { kind: "consultation", appointmentId: String(appt._id) },
  });

  await Payment.create({
    user: session.user.id,
    kind: "consultation",
    refId: appt._id,
    amountCents: doctorProfile.consultationFeeCents,
    currency: "inr",
    status: "pending",
    stripeSessionId: checkout.id,
  });

  if (!checkout.url) return { error: "Could not create payment session." };
  redirect(checkout.url);
}
