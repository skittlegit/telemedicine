import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Singleton key/value store for global platform settings (admin-controlled).
 * Currently used for the "payments enabled" toggle. Keep keys ASCII-only,
 * no PHI, no secrets.
 */
const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed },
    updatedBy: { type: String },
  },
  { timestamps: true, strict: true },
);

export type SettingDoc = InferSchemaType<typeof SettingSchema> & { _id: string };

export const Setting: Model<SettingDoc> =
  (models.Setting as Model<SettingDoc>) ||
  model<SettingDoc>("Setting", SettingSchema);

export const SETTING_KEYS = {
  paymentsEnabled: "payments.enabled",
} as const;
