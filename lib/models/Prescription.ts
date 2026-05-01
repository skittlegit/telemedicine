import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const DrugSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dose: { type: String, required: true, trim: true },
    freq: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1, max: 365 },
    notes: { type: String, default: "" },
  },
  { _id: false },
);

const PrescriptionSchema = new Schema(
  {
    appointment: { type: Types.ObjectId, ref: "Appointment", required: true, index: true },
    doctor: { type: Types.ObjectId, ref: "User", required: true, index: true },
    patient: { type: Types.ObjectId, ref: "User", required: true, index: true },
    drugs: { type: [DrugSchema], required: true, validate: (a: unknown[]) => a.length > 0 },
    diagnosisEnc: { type: String },
    issuedAt: { type: Date, required: true },
    /** HMAC-SHA256 hex over canonical drug list — independently verifiable. */
    signature: { type: String, required: true, index: true },
    /** Public verify token (separate from _id) for QR codes. */
    verifyToken: { type: String, required: true, unique: true, index: true },
    revokedAt: { type: Date },
    fulfilledAt: { type: Date },
  },
  { timestamps: true, strict: true },
);

// Dashboards render "your most recent prescriptions" for both patient and
// doctor views. Without these compound indexes Mongo had to scan all the
// matching docs and sort in memory on every page load — measurable nav lag
// once a few hundred prescriptions exist.
PrescriptionSchema.index({ patient: 1, createdAt: -1 });
PrescriptionSchema.index({ doctor: 1, createdAt: -1 });

export type PrescriptionDoc = InferSchemaType<typeof PrescriptionSchema> & { _id: string };

export const Prescription: Model<PrescriptionDoc> =
  (models.Prescription as Model<PrescriptionDoc>) ||
  model<PrescriptionDoc>("Prescription", PrescriptionSchema);
