"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
import { PharmacyOrderCreateSchema } from "@/lib/schemas";
import { PharmacyProfile } from "@/lib/models/PharmacyProfile";
import { PharmacyListing } from "@/lib/models/PharmacyListing";

export type PharmacyFormState = { error?: string };

const FULFILMENT_FEE_CENTS = 4900; // ₹49 fulfilment fee (paise)

export async function createPharmacyOrderAction(
  _prev: PharmacyFormState,
  formData: FormData,
): Promise<PharmacyFormState> {
  const session = await requireRole("patient");

  const parsed = PharmacyOrderCreateSchema.safeParse({
    prescriptionId: formData.get("prescriptionId"),
    pharmacyId: formData.get("pharmacyId"),
    address: {
      line1: formData.get("line1"),
      line2: formData.get("line2") ?? "",
      city: formData.get("city"),
      region: formData.get("region"),
      postalCode: formData.get("postalCode"),
      country: formData.get("country"),
    },
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Please complete the form." };
  }
  const { prescriptionId, pharmacyId, address } = parsed.data;

  await connectDB();
  const rx = await Prescription.findById(prescriptionId).lean<{
    _id: Types.ObjectId;
    patient: Types.ObjectId;
    revokedAt?: Date;
    fulfilledAt?: Date;
  } | null>();
  if (!rx) return { error: "Prescription not found." };
  if (String(rx.patient) !== session.user.id) return { error: "Not your prescription." };
  if (rx.revokedAt) return { error: "This prescription has been revoked." };
  if (rx.fulfilledAt) return { error: "This prescription has already been fulfilled." };

  const pharmacy = await PharmacyProfile.findOne({
    user: pharmacyId,
    licenseVerifiedAt: { $ne: null },
  }).lean<{ user: Types.ObjectId } | null>();
  if (!pharmacy) return { error: "That pharmacy is unavailable. Please pick another." };

  const order = await PharmacyOrder.create({
    prescription: rx._id,
    patient: session.user.id,
    pharmacy: pharmacyId,
    pharmacist: pharmacyId, // auto-claimed by chosen pharmacy
    status: "claimed",
    claimedAt: new Date(),
    deliveryAddressEnc: encryptPHI(JSON.stringify(address)) ?? "",
    totalCents: FULFILMENT_FEE_CENTS,
  });

  await audit({
    actor: session.user.id,
    actorRole: "patient",
    action: "pharmacy.order.create",
    target: `PharmacyOrder:${order._id}`,
    meta: { pharmacy: pharmacyId },
  });

  if (!isStripeConfigured()) {
    redirect(`/dashboard/orders/${order._id}?placed=1`);
  }

  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          unit_amount: FULFILMENT_FEE_CENTS,
          product_data: { name: "Pharmacy fulfilment & delivery" },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.APP_URL}/dashboard/orders/${order._id}?placed=1`,
    cancel_url: `${env.APP_URL}/dashboard/orders/${order._id}?cancelled=1`,
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

/* ====================================================================
   Pharmacy listings — create / update stock + active flag.
   Each pharmacist owns their own listings.
   ==================================================================== */

const VALID_CATS = [
  "otc",
  "rx",
  "wellness",
  "devices",
  "first-aid",
  "cold-chain",
] as const;

export type MarketplaceItemInput = {
  productId: string;
  name: string;
  strength?: string;
  qty: number;
  priceCents: number;
  pharmacyId?: string;
};

export async function placeMarketplaceOrderAction(
  items: MarketplaceItemInput[],
): Promise<{ ok?: boolean; orderId?: string; error?: string }> {
  const session = await requireRole("patient");
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Basket is empty." };
  }
  const cleaned = items
    .map((it) => ({
      productId: String(it.productId ?? ""),
      name: String(it.name ?? ""),
      strength: String(it.strength ?? ""),
      qty: Math.max(1, Math.floor(Number(it.qty) || 0)),
      priceCents: Math.max(0, Math.floor(Number(it.priceCents) || 0)),
      pharmacyId: String(it.pharmacyId ?? ""),
    }))
    .filter((it) => it.productId && it.name && it.qty > 0);
  if (cleaned.length === 0) return { error: "Basket is empty." };

  const totalCents = cleaned.reduce((s, it) => s + it.priceCents * it.qty, 0);

  await connectDB();
  const order = await PharmacyOrder.create({
    kind: "marketplace",
    patient: session.user.id,
    status: "queued",
    totalCents,
    items: cleaned,
    deliveryAddressEnc: "",
  });

  await audit({
    actor: session.user.id,
    actorRole: "patient",
    action: "pharmacy.marketplace_order.create",
    target: `PharmacyOrder:${order._id}`,
    meta: { itemCount: cleaned.length, totalCents },
  });

  revalidatePath("/dashboard/orders");
  return { ok: true, orderId: String(order._id) };
}

export async function addListingAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireRole("pharmacist");
  const name = String(formData.get("name") ?? "").trim();
  const generic = String(formData.get("generic") ?? "").trim();
  const category = String(formData.get("category") ?? "otc");
  const priceRupees = Number(formData.get("priceRupees") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);

  if (!name) return { error: "Name is required." };
  if (!VALID_CATS.includes(category as (typeof VALID_CATS)[number]))
    return { error: "Invalid category." };
  if (!Number.isFinite(priceRupees) || priceRupees < 0)
    return { error: "Price must be a positive number." };
  if (!Number.isFinite(stock) || stock < 0)
    return { error: "Stock must be zero or greater." };

  await connectDB();
  await PharmacyListing.create({
    pharmacy: session.user.id,
    name,
    generic,
    category: category as (typeof VALID_CATS)[number],
    priceCents: Math.round(priceRupees * 100),
    stock: Math.floor(stock),
    active: true,
  });
  await audit({
    actor: session.user.id,
    actorRole: "pharmacist",
    action: "pharmacy.listing.create",
    target: `PharmacyListing:${name}`,
  });
  revalidatePath("/dashboard/pharmacy/listings");
  return { ok: true };
}

export async function updateListingAction(formData: FormData): Promise<void> {
  const session = await requireRole("pharmacist");
  const id = String(formData.get("id") ?? "");
  if (!Types.ObjectId.isValid(id)) return;

  await connectDB();
  const update: Record<string, unknown> = {};
  if (formData.has("stock")) {
    const stock = Number(formData.get("stock"));
    if (Number.isFinite(stock) && stock >= 0) update.stock = Math.floor(stock);
  }
  if (formData.has("active")) {
    update.active = formData.get("active") === "1";
  }
  if (formData.has("priceRupees")) {
    const r = Number(formData.get("priceRupees"));
    if (Number.isFinite(r) && r >= 0) update.priceCents = Math.round(r * 100);
  }

  if (Object.keys(update).length === 0) return;

  await PharmacyListing.findOneAndUpdate(
    { _id: id, pharmacy: session.user.id },
    update,
  );
  await audit({
    actor: session.user.id,
    actorRole: "pharmacist",
    action: "pharmacy.listing.update",
    target: `PharmacyListing:${id}`,
    meta: update,
  });
  revalidatePath("/dashboard/pharmacy/listings");
}

export async function deleteListingAction(formData: FormData): Promise<void> {
  const session = await requireRole("pharmacist");
  const id = String(formData.get("id") ?? "");
  if (!Types.ObjectId.isValid(id)) return;

  await connectDB();
  await PharmacyListing.findOneAndDelete({
    _id: id,
    pharmacy: session.user.id,
  });
  await audit({
    actor: session.user.id,
    actorRole: "pharmacist",
    action: "pharmacy.listing.delete",
    target: `PharmacyListing:${id}`,
  });
  revalidatePath("/dashboard/pharmacy/listings");
}
