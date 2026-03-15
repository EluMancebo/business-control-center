// src/lib/taller/sections/registry.ts

import type { SectionDefinition, SectionId, SectionSlotType } from "./types";
import type { HeroData } from "@/lib/taller/presets/hero/types";

const heroPayloadSchema: Record<keyof HeroData, { type: SectionSlotType; required: boolean }> = {
  badge: { type: "text", required: true },
  title: { type: "text", required: true },
  description: { type: "textarea", required: true },
  primaryCtaLabel: { type: "text", required: true },
  primaryCtaHref: { type: "url", required: true },
  secondaryCtaLabel: { type: "text", required: true },
  secondaryCtaHref: { type: "url", required: true },
  backgroundImageUrl: { type: "image", required: true },
  logoUrl: { type: "image", required: true },
  logoSvg: { type: "svg", required: true },
};

export const sectionsRegistry: Record<SectionId, SectionDefinition> = {
  hero: {
    id: "hero",
    label: "Hero",
    description: "Configuración del hero (badge, título, CTAs y medios).",
    variantSource: "presets",
    slots: [
      { key: "badge", label: "Badge", type: "text", required: true },
      { key: "title", label: "Título", type: "text", required: true },
      { key: "description", label: "Descripción", type: "textarea", required: true },
      { key: "primaryCtaLabel", label: "CTA primaria (texto)", type: "text", required: true },
      { key: "primaryCtaHref", label: "CTA primaria (href)", type: "url", required: true },
      { key: "secondaryCtaLabel", label: "CTA secundaria (texto)", type: "text", required: true },
      { key: "secondaryCtaHref", label: "CTA secundaria (href)", type: "url", required: true },
      { key: "backgroundImageUrl", label: "Imagen de fondo", type: "image", required: true },
      { key: "logoUrl", label: "Logo (URL)", type: "image", required: true },
      { key: "logoSvg", label: "Logo (SVG)", type: "svg", required: true },
    ],
    payloadSchema: heroPayloadSchema,
  },
};

export function getSectionDefinition(id: SectionId) {
  return sectionsRegistry[id];
}

export function listSectionDefinitions() {
  return Object.values(sectionsRegistry);
}
