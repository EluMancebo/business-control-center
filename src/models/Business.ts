import { Schema, models, model } from "mongoose";

const BusinessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },

    // Hero preset activo (A/B/C/etc). La web pública lo usa para leer published.
    activeHeroVariantKey: { type: String, default: "default" },
  },
  { timestamps: true }
);

export const Business = models.Business || model("Business", BusinessSchema);
