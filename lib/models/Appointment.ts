import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

export const APPOINTMENT_STATUS = [
  "pending_payment",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const;

const AppointmentSchema = new Schema(
  {
    patient: { type: Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: Types.ObjectId, ref: "User", required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30 },
    reasonEnc: { type: String }, // PHI: chief complaint
    notesEnc: { type: String }, // PHI: clinician notes after consult
    status: { type: String, enum: APPOINTMENT_STATUS, default: "pending_payment", index: true },
    feeCents: { type: Number, required: true, min: 0 },
    paymentIntentId: { type: String, index: true },
    roomId: { type: String, unique: true, sparse: true, index: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true },
);

AppointmentSchema.index({ doctor: 1, startAt: 1 });
AppointmentSchema.index({ patient: 1, startAt: -1 });

export type AppointmentDoc = InferSchemaType<typeof AppointmentSchema> & { _id: string };

export const Appointment: Model<AppointmentDoc> =
  (models.Appointment as Model<AppointmentDoc>) ||
  model<AppointmentDoc>("Appointment", AppointmentSchema);
