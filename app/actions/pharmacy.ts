"use server";

import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Prescription } from "@/lib/models/Prescription";
import { PharmacyOrder } from "@/lib/models/PharmacyOrder";
import { Payment } from "@/lib/models/Payment";
import { encryptPHI } from "@/lib/crypto";
import { requireRole } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { env } from "@/lib/env";
import { PharmacyAddressSchema } from "@/lib/schemas";

export type PharmacyFormState = { error?: string };

const FULFILMENT_FEE_CENTS = 1500; // $15

export async function createPharmacyOrderAction(
  _prev: PharmacyFormState,
  formData: FormData,
): Promise<PharmacyFormState> {
  const session = await requireRole("patient");

  const prescriptionId = String(formData.get("prescriptionId") ?? "");
  if (!Types.ObjectId.isValid(prescriptionId)) return { error: "Invalid prescription." };

  const addr = PharmacyAddressSchema.safeParse({
    line1: formData.get("line1"),
    line2: formData.get("line2") ?? "",
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
  });
  if (!addr.success) return { error: "Please complete the delivery address." };

  await connectDB();
  const rx = await Prescription.findById(prescriptionId).lean<{
    _id: unknown;
    patient: unknown;
    revokedAt?: Date;
    fulfilledAt?: Date;
  } | null>();
  if (!rx) return { error: "Prescription not found." };
  if (String(rx.patient) !== session.user.id) return { error: "Not your prescription." };
  if (rx.revokedAt) return { error: "This prescription has been revoked." };
  if (rx.fulfilledAt) return { error: "This prescription has already been fulfilled." };

  const order = await PharmacyOrder.create({
    prescription: rx._id,
    patient: session.user.id,
    status: "queued",
    deliveryAddressEnc: encryptPHI(JSON.stringify(addr.data)),
    totalCents: FULFILMENT_FEE_CENTS,
  });

  await audit({
    actor: session.user.id,
    actorRole: "patient",
    action: "pharmacy.order.create",
    target: `PharmacyOrder:${order._id}`,
  });

  if (!isStripeConfigured()) {
    redirect(`/dashboard?pharmacy=${order._id}`);
  }

  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: FULFILMENT_FEE_CENTS,
          product_data: { name: "Pharmacy fulfilment & delivery" },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.APP_URL}/dashboard?pharmacy=${order._id}&paid=1`,
    cancel_url: `${env.APP_URL}/dashboard?pharmacy=${order._id}&cancelled=1`,
    metadata: { kind: "pharmacy", orderId: String(order._id) },
  });

  await Payment.create({
    user: session.user.id,
    kind: "pharmacy",
    refId: order._id,
    amountCents: FULFILMENT_FEE_CENTS,
    status: "pending",
    stripeSessionId: checkout.id,
  });

  if (!checkout.url) return { error: "Could not create payment session." };
  redirect(checkout.url);
}

export async function claimOrderAction(formData: FormData): Promise<void> {
  const session = await requireRole("pharmacist");
  const orderId = String(formData.get("orderId") ?? "");
  if (!Types.ObjectId.isValid(orderId)) return;

  await connectDB();
  const updated = await PharmacyOrder.findOneAndUpdate(
    { _id: orderId, status: "queued" },
    { status: "claimed", pharmacist: session.user.id, claimedAt: new Date() },
    { new: true },
  );
  if (updated) {
    await audit({
      actor: session.user.id,
      actorRole: "pharmacist",
      action: "pharmacy.order.claim",
      target: `PharmacyOrder:${orderId}`,
    });
  }
  redirect(`/dashboard/pharmacy/${orderId}`);
}

export async function advanceOrderAction(formData: FormData): Promise<void> {
  const session = await requireRole("pharmacist");
  const orderId = String(formData.get("orderId") ?? "");
  const next = String(formData.get("next") ?? "");
  const allowed = ["preparing", "out_for_delivery", "delivered", "cancelled"];
  if (!Types.ObjectId.isValid(orderId) || !allowed.includes(next)) return;

  await connectDB();
  const update: Record<string, unknown> = { status: next };
  if (next === "delivered") update.deliveredAt = new Date();

  const order = await PharmacyOrder.findOneAndUpdate(
    { _id: orderId, pharmacist: session.user.id },
    update,
    { new: true },
  );
  if (order && next === "delivered") {
    await Prescription.findByIdAndUpdate(order.prescription, {
      fulfilledAt: new Date(),
    });
  }
  await audit({
    actor: session.user.id,
    actorRole: "pharmacist",
    action: `pharmacy.order.${next}`,
    target: `PharmacyOrder:${orderId}`,
  });
  redirect(`/dashboard/pharmacy/${orderId}`);
}
