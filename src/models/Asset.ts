import { Schema, models, model } from "mongoose";

const AssetSchema = new Schema(
  {
    // null => librería del sistema (Taller)
    businessId: { type: Schema.Types.ObjectId, ref: "Business", default: null },

    // "system" (Taller) | "tenant" (negocio)
    scope: { type: String, enum: ["system", "tenant"], default: "system" },

    kind: { type: String, enum: ["image", "svg", "video", "pdf"], default: "image" },
    formatKind: { type: String, enum: ["image", "svg", "video", "pdf"], default: "image" },
    assetRole: {
      type: String,
      enum: ["logo", "icon", "photo", "illustration", "texture", "document", "video"],
      default: "photo",
    },
    preferredUsage: {
      type: String,
      enum: [
        "hero-background",
        "hero-logo",
        "navbar-logo",
        "footer-mark",
        "banner-background",
        "popup-media",
        "gallery-item",
        "social-asset",
        "card-media",
        "document-embed",
      ],
      default: null,
    },
    allowedComponents: {
      type: [String],
      enum: ["hero", "banner", "header", "footer", "popup", "card", "gallery", "social", "document"],
      default: [],
    },
    reviewStatus: {
      type: String,
      enum: ["draft", "reviewed", "approved", "rejected", "deprecated"],
      default: "draft",
    },
    orientation: {
      type: String,
      enum: ["landscape", "portrait", "square", "unknown"],
      default: "unknown",
    },
    aspectRatio: { type: String, default: "" },
    brandCritical: { type: Boolean, default: false },
    vectorizable: { type: Boolean, default: false },
    animable: { type: Boolean, default: false },

    // Vercel Blob
    bucket: { type: String, default: "vercel-blob" },
    key: { type: String, required: true }, // pathname del blob
    url: { type: String, required: true },

    label: { type: String, required: true, trim: true },

    // tagging / permisos por slot
    tags: { type: [String], default: [] },       // ej: ["hero:logo"]
    allowedIn: { type: [String], default: [] },  // ej: ["hero.logo"]

    // metadata opcional
    mime: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },

    // pipeline / derivados (Bloque A v2)
    sourceAssetId: { type: Schema.Types.ObjectId, ref: "Asset", default: null },
    variantKey: {
      type: String,
      enum: ["original", "thumbnail", "optimized", "vectorized-svg"],
      default: "original",
    },
    pipelineStatus: {
      type: String,
      enum: ["queued", "processing", "ready", "failed", "skipped"],
      default: "ready",
    },
    pipelineStage: {
      type: String,
      enum: ["ingest", "analyze", "derive", "vectorize", "done"],
      default: "done",
    },
    pipelineError: { type: String, default: "" },

    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

export const Asset = models.Asset || model("Asset", AssetSchema);    
