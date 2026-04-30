import {
  Schema,
  model,
  models,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Pharmacist-side licensure + dispensary record. Created at registration
 * (with the values the applicant submits) and verified by an admin during
 * approval. Address is *not* PHI in this app — it's the pharmacy's address,
 * not the patient's.
 */
const PharmacyProfileSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    pharmacyName: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    licenseRegion: { type: String, required: true, trim: true },
    licenseVerifiedAt: { type: Date },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    region: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true },
);

export type PharmacyProfileDoc = InferSchemaType<typeof PharmacyProfileSchema> & {
  _id: string;
};

export const PharmacyProfile: Model<PharmacyProfileDoc> =
  (models.PharmacyProfile as Model<PharmacyProfileDoc>) ||
  model<PharmacyProfileDoc>("PharmacyProfile", PharmacyProfileSchema);
