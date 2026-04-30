import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const PAYMENT_STATUS = ["pending", "succeeded", "failed", "refunded"] as const;
export const PAYMENT_KIND = ["consultation", "pharmacy"] as const;

const PaymentSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: PAYMENT_KIND, required: true, index: true },
    refId: { type: Types.ObjectId, required: true, index: true }, // Appointment or PharmacyOrder
    amountCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },
    status: { type: String, enum: PAYMENT_STATUS, default: "pending", index: true },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String, index: true },
    failureMessage: { type: String },
  },
  { timestamps: true },
);

export type PaymentDoc = InferSchemaType<typeof PaymentSchema> & { _id: string };

export const Payment: Model<PaymentDoc> =
  (models.Payment as Model<PaymentDoc>) ||
  model<PaymentDoc>("Payment", PaymentSchema);
