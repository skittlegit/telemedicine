import {
  Schema,
  model,
  models,
  Types,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * A medicine listing owned by a pharmacist user. The marketplace surface
 * still uses the static demo catalog in app/pharmacy/_data.ts; these are
 * the listings the pharmacist personally manages from the dashboard.
 */
const PharmacyListingSchema = new Schema(
  {
    pharmacy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    generic: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: ["otc", "rx", "wellness", "devices", "first-aid", "cold-chain"],
      default: "otc",
    },
    priceCents: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, strict: true },
);

export type PharmacyListingDoc = InferSchemaType<typeof PharmacyListingSchema> & {
  _id: string;
};

export const PharmacyListing: Model<PharmacyListingDoc> =
  (models.PharmacyListing as Model<PharmacyListingDoc>) ||
  model<PharmacyListingDoc>("PharmacyListing", PharmacyListingSchema);
