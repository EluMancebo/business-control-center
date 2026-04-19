import { Schema, model, models } from "mongoose";
import {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
} from "@/lib/brand-theme/presets";

const BrandPresetTokensSchema = new Schema(
  {
    primary: { type: String, required: true, trim: true },
    accent: { type: String, required: true, trim: true },
    neutral: { type: String, required: true, trim: true },
    background: { type: String, required: true, trim: true },
    card: { type: String, required: true, trim: true },
    surface2: { type: String, required: true, trim: true },
    surface3: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    border: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const BrandPresetSchema = new Schema(
  {
    businessSlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: false, index: true },
    sourceMode: {
      type: String,
      enum: ["manual", "logo", "hybrid"],
      default: "manual",
    },
    harmony: {
      type: String,
      enum: BRAND_THEME_HARMONY_OPTIONS,
      default: "analogous",
    },
    accentStyle: {
      type: String,
      enum: BRAND_THEME_ACCENT_STYLE_OPTIONS,
      default: "balanced",
    },
    typography: {
      type: String,
      enum: BRAND_THEME_TYPOGRAPHY_OPTIONS,
      default: "modern",
    },
    tokens: { type: BrandPresetTokensSchema, required: true },
  },
  { timestamps: true }
);

BrandPresetSchema.index(
  { businessSlug: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
BrandPresetSchema.index({ businessSlug: 1, updatedAt: -1 });

export const BrandPreset = models.BrandPreset || model("BrandPreset", BrandPresetSchema);
