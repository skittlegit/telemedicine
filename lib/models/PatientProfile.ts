import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

/**
 * All free-text PHI fields are stored as AES-256-GCM ciphertext (base64).
 * Use `encryptPHI` / `decryptPHI` from `lib/crypto.ts`.
 */
const PatientProfileSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    dobEnc: { type: String }, // ISO date encrypted
    sex: { type: String, enum: ["male", "female", "other", "unspecified"], default: "unspecified" },
    phoneEnc: { type: String },
    addressEnc: { type: String }, // JSON encrypted
    allergiesEnc: { type: String }, // JSON array encrypted
    conditionsEnc: { type: String },
    medicationsEnc: { type: String },
    insuranceEnc: { type: String },
    emergencyContactEnc: { type: String },
  },
  { timestamps: true, strict: true },
);

export type PatientProfileDoc = InferSchemaType<typeof PatientProfileSchema> & { _id: string };

export const PatientProfile: Model<PatientProfileDoc> =
  (models.PatientProfile as Model<PatientProfileDoc>) ||
  model<PatientProfileDoc>("PatientProfile", PatientProfileSchema);
