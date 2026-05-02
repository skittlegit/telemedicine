import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const PHARMACY_ORDER_STATUS = [
  "queued",
  "claimed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const PHARMACY_ORDER_KINDS = ["rx", "marketplace"] as const;

const PharmacyOrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    strength: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
    priceCents: { type: Number, required: true, min: 0 },
    pharmacyId: { type: String, default: "" },
  },
  { _id: false },
);

const PharmacyOrderSchema = new Schema(
  {
    kind: { type: String, enum: PHARMACY_ORDER_KINDS, default: "rx", index: true },
    prescription: { type: Types.ObjectId, ref: "Prescription", index: true },
    patient: { type: Types.ObjectId, ref: "User", required: true, index: true },
    pharmacist: { type: Types.ObjectId, ref: "User", index: true },
    pharmacy: { type: Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: PHARMACY_ORDER_STATUS, default: "queued", index: true },
    deliveryAddressEnc: { type: String, default: "" }, // PHI
    totalCents: { type: Number, required: true, min: 0 },
    items: { type: [PharmacyOrderItemSchema], default: [] },
    paymentIntentId: { type: String, index: true },
    paidAt: { type: Date },
    claimedAt: { type: Date },
    deliveredAt: { type: Date },
    notesEnc: { type: String },
  },
  { timestamps: true, strict: true },
);

export type PharmacyOrderDoc = InferSchemaType<typeof PharmacyOrderSchema> & { _id: string };

export const PharmacyOrder: Model<PharmacyOrderDoc> =
  (models.PharmacyOrder as Model<PharmacyOrderDoc>) ||
  model<PharmacyOrderDoc>("PharmacyOrder", PharmacyOrderSchema);
