import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const DoctorProfileSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    specialty: { type: String, required: true, trim: true, index: true },
    bio: { type: String, default: "" },
    licenseNumber: { type: String, required: true, trim: true },
    licenseRegion: { type: String, required: true, trim: true },
    licenseVerifiedAt: { type: Date },
    yearsOfExperience: { type: Number, min: 0, default: 0 },
    languages: { type: [String], default: [] },
    consultationFeeCents: { type: Number, required: true, min: 0, default: 89900 },
    // Free-form weekly availability blocks (UTC).
    availability: {
      type: [
        {
          dow: { type: Number, min: 0, max: 6 }, // 0=Sun
          startMinutes: { type: Number, min: 0, max: 1440 },
          endMinutes: { type: Number, min: 0, max: 1440 },
        },
      ],
      default: [],
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true, strict: true },
);

DoctorProfileSchema.index({ specialty: 1, "rating": -1 });

export type DoctorProfileDoc = InferSchemaType<typeof DoctorProfileSchema> & { _id: string };

export const DoctorProfile: Model<DoctorProfileDoc> =
  (models.DoctorProfile as Model<DoctorProfileDoc>) ||
  model<DoctorProfileDoc>("DoctorProfile", DoctorProfileSchema);
