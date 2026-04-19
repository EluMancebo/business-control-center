import { Schema, model, models } from "mongoose";

const BusinessBrandConfigSchema = new Schema(
  {
    businessSlug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    activeBrandPresetId: {
      type: Schema.Types.ObjectId,
      ref: "BrandPreset",
      default: null,
    },
    mode: {
      type: String,
      enum: ["system", "light", "dark"],
      default: "system",
    },
  },
  { timestamps: true }
);

BusinessBrandConfigSchema.index({ businessSlug: 1 }, { unique: true });

export const BusinessBrandConfig =
  models.BusinessBrandConfig || model("BusinessBrandConfig", BusinessBrandConfigSchema);
