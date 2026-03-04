import { Schema, models, model } from "mongoose";

// Repetimos el schema del Hero "data" (evitamos dependencias cruzadas)
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

const PublishedHeroSchema = new Schema(
  {
    variantKey: { type: String, required: true, trim: true },
    data: { type: HeroDataSchema, required: true },
  },
  { _id: false }
);

const PublishedVersionSchema = new Schema(
  {
    version: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },

    // En esta fase: snapshot mínimo con Hero.
    // Más adelante: sections, seo, nav, resolvedMedia, etc.
    hero: { type: PublishedHeroSchema, required: true },
  },
  { _id: false }
);

const PublishedPageSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    businessSlug: { type: String, required: true, trim: true, lowercase: true },

    // "home" en este MVP (luego: "landing:<id>", "offers", etc.)
    pageKey: { type: String, required: true, trim: true, lowercase: true },

    latestVersion: { type: Number, default: 0 },
    versions: { type: [PublishedVersionSchema], default: [] },
  },
  { timestamps: true }
);

PublishedPageSchema.index({ businessId: 1, pageKey: 1 }, { unique: true });
PublishedPageSchema.index({ businessSlug: 1, pageKey: 1 });

export const PublishedPage =
  models.PublishedPage || model("PublishedPage", PublishedPageSchema);    