import { Schema, models, model } from "mongoose";

const AssetSchema = new Schema(
  {
    // null => librería del sistema (Taller)
    businessId: { type: Schema.Types.ObjectId, ref: "Business", default: null },

    // "system" (Taller) | "tenant" (negocio)
    scope: { type: String, enum: ["system", "tenant"], default: "system" },

    kind: { type: String, enum: ["image", "svg", "video"], default: "image" },

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

    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

export const Asset = models.Asset || model("Asset", AssetSchema);    