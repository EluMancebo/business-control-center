import { Schema, model, models } from "mongoose";
import {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
  DEFAULT_BRAND_THEME_CONFIG,
} from "@/lib/brand-theme";

const STUDIO_APPEARANCE_ATMOSPHERE_OPTIONS = ["bcc", "ocean", "sunset", "mono"] as const;

const StudioAppearanceConfigSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      default: "studio",
    },
    mode: {
      type: String,
      enum: ["system", "light", "dark"],
      default: "system",
    },
    atmosphere: {
      type: String,
      enum: [...STUDIO_APPEARANCE_ATMOSPHERE_OPTIONS],
      default: "bcc",
    },
    harmony: {
      type: String,
      enum: BRAND_THEME_HARMONY_OPTIONS,
      default: DEFAULT_BRAND_THEME_CONFIG.harmony,
    },
    accentStyle: {
      type: String,
      enum: BRAND_THEME_ACCENT_STYLE_OPTIONS,
      default: DEFAULT_BRAND_THEME_CONFIG.accentStyle,
    },
    typography: {
      type: String,
      enum: BRAND_THEME_TYPOGRAPHY_OPTIONS,
      default: DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
    },
  },
  { timestamps: true }
);

export const StudioAppearanceConfig =
  models.StudioAppearanceConfig ||
  model("StudioAppearanceConfig", StudioAppearanceConfigSchema);
