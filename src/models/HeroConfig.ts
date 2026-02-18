// src/models/HeroConfig.ts
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

    // MVP: logo opcional (luego lo convertimos a Asset ID)
    logoUrl: { type: String, default: "" },
  },
  { _id: false }
);

const HeroConfigSchema = new Schema(
  {
    // MVP single-tenant: si luego quieres multi-tenant, lo hacemos required + businessId
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: false },

    // "draft" = lo que editas en panel
    // "published" = lo que lee la web pública
    status: { type: String, enum: ["draft", "published"], required: true },

    // por si mañana tienes variantes (navidad, rebajas, etc.)
    variantKey: { type: String, default: "default" },

    data: { type: HeroDataSchema, required: true },
  },
  { timestamps: true }
);

// 1 draft + 1 published por variant (y por negocio si luego activas businessId)
HeroConfigSchema.index(
  { businessId: 1, status: 1, variantKey: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["draft", "published"] } } }
);

export const HeroConfig =
  models.HeroConfig || model("HeroConfig", HeroConfigSchema);
