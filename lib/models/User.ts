import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ROLES = ["patient", "doctor", "pharmacist", "admin"] as const;
export type Role = (typeof ROLES)[number];

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, default: "patient", index: true },
    image: { type: String },
    emailVerifiedAt: { type: Date },
    // Doctors pending licensure review start as "pending".
    status: { type: String, enum: ["active", "pending", "disabled"], default: "active", index: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
