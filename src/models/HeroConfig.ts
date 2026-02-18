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

    // Fondo del hero (imagen)
    backgroundImageUrl: { type: String, default: "" },

    // Logo como URL (fallback)
    logoUrl: { type: String, default: "" },

    // Logo SVG inline (para poder animarlo en la web pública)
    // Guardas aquí el markup SVG (string) desde el panel/presets.
    logoSvg: { type: String, default: "" },
  },
  { _id: false }
);

const HeroConfigSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    businessSlug: { type: String, required: true, trim: true, lowercase: true },

    status: { type: String, enum: ["draft", "published"], required: true },
    variantKey: { type: String, default: "default" },

    data: { type: HeroDataSchema, required: true },
  },
  { timestamps: true }
);

HeroConfigSchema.index(
  { businessId: 1, businessSlug: 1, status: 1, variantKey: 1 },
  { unique: true }
);

export const HeroConfig =
  models.HeroConfig || model("HeroConfig", HeroConfigSchema);
