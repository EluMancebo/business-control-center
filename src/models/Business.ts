//src/models/Business.ts

import { Schema, models, model } from "mongoose";

export const SECTOR_KEYS = [
  "barberia",
  "peluqueria",
  "estetica",
  "salud",
  "dental",
  "taller",
  "inmobiliaria",
  "servicios",
  "fitness",
  "restauracion",
  "comercio",
  "general",
] as const;
export type SectorKey = (typeof SECTOR_KEYS)[number];

export const BUSINESS_TYPE_KEYS = [
  "appointment-based",
  "local-services",
  "lead-generation",
  "catalog",
  "ecommerce",
  "content",
  "mixed",
] as const;
export type BusinessTypeKey = (typeof BUSINESS_TYPE_KEYS)[number];

const BusinessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },

    // Hero preset activo (A/B/C/etc). La web pública lo usa para leer published.
    activeHeroVariantKey: { type: String, default: "default" },

    // Capa 0 lo asigna. Orienta vocabulario y UX (sector)
    sector: { type: String, enum: [...SECTOR_KEYS], default: null },

    // Capa 0 lo asigna. Define lógica operativa y pipelines (businessTypes)
    businessTypes: { type: [String], enum: [...BUSINESS_TYPE_KEYS], default: [] },
  },
  { timestamps: true }
);

export const Business = models.Business || model("Business", BusinessSchema);
