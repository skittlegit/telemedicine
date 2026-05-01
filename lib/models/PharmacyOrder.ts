import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const PHARMACY_ORDER_STATUS = [
  "queued",
  "claimed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const PharmacyOrderSchema = new Schema(
  {
    prescription: { type: Types.ObjectId, ref: "Prescription", required: true, index: true },
    patient: { type: Types.ObjectId, ref: "User", required: true, index: true },
    pharmacist: { type: Types.ObjectId, ref: "User", index: true },
    pharmacy: { type: Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: PHARMACY_ORDER_STATUS, default: "queued", index: true },
    deliveryAddressEnc: { type: String, required: true }, // PHI
    totalCents: { type: Number, required: true, min: 0 },
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
