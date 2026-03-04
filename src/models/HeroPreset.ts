import { Schema, models, model } from "mongoose";

const HeroDataSchema = new Schema(
  {
    badge: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },

    primaryCtaLabel: { type: String, required: true },
    primaryCtaHref: { type: String, required: true },
    secondaryCtaLabel: { type: String, required: true },
    secondaryCtaHref: { type: String, required: true },

    backgroundImageUrl: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    logoSvg: { type: String, default: "" },
  },
  { _id: false }
);

const HeroPresetSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, lowercase: true, unique: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    tags: { type: [String], default: [] },
    status: { type: String, enum: ["active", "archived"], default: "active" },

    // preset base (lo que el sistema propone)
    data: { type: HeroDataSchema, required: true },
  },
  { timestamps: true }
);

HeroPresetSchema.index({ status: 1, createdAt: -1 });

export const HeroPreset = models.HeroPreset || model("HeroPreset", HeroPresetSchema);    