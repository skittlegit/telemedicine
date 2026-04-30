import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

/**
 * Append-only event log. Documents are never updated/deleted by application code.
 */
const AuditLogSchema = new Schema(
  {
    actor: { type: Types.ObjectId, ref: "User", index: true },
    actorRole: { type: String },
    action: { type: String, required: true, index: true }, // e.g. "auth.login", "prescription.create"
    target: { type: String, index: true }, // free-form ref, e.g. "Appointment:abc"
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Schema.Types.Mixed }, // never include PHI
  },
  { timestamps: true, capped: false },
);

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema> & { _id: string };

export const AuditLog: Model<AuditLogDoc> =
  (models.AuditLog as Model<AuditLogDoc>) ||
  model<AuditLogDoc>("AuditLog", AuditLogSchema);
