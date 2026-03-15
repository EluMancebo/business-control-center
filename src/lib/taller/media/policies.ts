// src/lib/taller/media/policies.ts

import type { MediaUsageContext, MediaPolicy } from "./types";

// Configuración inicial de políticas por contexto de uso
// Base mínima: define restricciones y guías para cada zona del layout
const mediaPolicies: Record<MediaUsageContext, MediaPolicy> = {
  "brand.logo.header": {
    allowedMimeTypes: ["image/png", "image/svg+xml"],
    maxBytes: 1024 * 1024, // 1MB
    minWidth: 100,
    minHeight: 100,
    recommendedRatio: "1:1",
    requiredRatio: "1:1",
    generateVariants: false,
    allowOverlay: false,
    requireAltText: true,
    cropMode: "center",
  },
  "brand.logo.footer": {
    allowedMimeTypes: ["image/png", "image/svg+xml"],
    maxBytes: 512 * 1024, // 512KB
    minWidth: 50,
    minHeight: 50,
    recommendedRatio: "1:1",
    requiredRatio: "1:1",
    generateVariants: false,
    allowOverlay: false,
    requireAltText: true,
    cropMode: "center",
  },
  "home.hero.background": {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * 1024 * 1024, // 5MB
    minWidth: 1920,
    minHeight: 1080,
    recommendedRatio: "16:9",
    requiredRatio: undefined,
    generateVariants: true,
    allowOverlay: true,
    requireAltText: false,
    cropMode: "smart",
  },
  "home.gallery.item": {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 2 * 1024 * 1024, // 2MB
    minWidth: 800,
    minHeight: 600,
    recommendedRatio: "4:3",
    requiredRatio: undefined,
    generateVariants: true,
    allowOverlay: false,
    requireAltText: true,
    cropMode: "center",
  },
  "home.services.card": {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 1 * 1024 * 1024, // 1MB
    minWidth: 400,
    minHeight: 300,
    recommendedRatio: "4:3",
    requiredRatio: undefined,
    generateVariants: false,
    allowOverlay: false,
    requireAltText: true,
    cropMode: "center",
  },
  "catalog.product.cover": {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 2 * 1024 * 1024, // 2MB
    minWidth: 800,
    minHeight: 800,
    recommendedRatio: "1:1",
    requiredRatio: "1:1",
    generateVariants: true,
    allowOverlay: false,
    requireAltText: true,
    cropMode: "center",
  },
  "catalog.product.gallery": {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 1 * 1024 * 1024, // 1MB
    minWidth: 600,
    minHeight: 600,
    recommendedRatio: "1:1",
    requiredRatio: undefined,
    generateVariants: true,
    allowOverlay: false,
    requireAltText: true,
    cropMode: "center",
  },
  "news.item.cover": {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 2 * 1024 * 1024, // 2MB
    minWidth: 1200,
    minHeight: 675,
    recommendedRatio: "16:9",
    requiredRatio: undefined,
    generateVariants: true,
    allowOverlay: true,
    requireAltText: true,
    cropMode: "smart",
  },
  "popup.campaign.cover": {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 3 * 1024 * 1024, // 3MB
    minWidth: 800,
    minHeight: 600,
    recommendedRatio: "4:3",
    requiredRatio: undefined,
    generateVariants: false,
    allowOverlay: true,
    requireAltText: true,
    cropMode: "center",
  },
};

// Helpers de lectura para integración futura
export function getMediaPolicyForContext(context: MediaUsageContext): MediaPolicy {
  return mediaPolicies[context];
}

export function getAllowedMimeTypesForContext(context: MediaUsageContext): string[] {
  return mediaPolicies[context].allowedMimeTypes;
}

export function getRecommendedMediaGuidance(context: MediaUsageContext): {
  maxBytes: number;
  minWidth?: number;
  minHeight?: number;
  recommendedRatio?: string;
  cropMode: string;
} {
  const policy = mediaPolicies[context];
  return {
    maxBytes: policy.maxBytes,
    minWidth: policy.minWidth,
    minHeight: policy.minHeight,
    recommendedRatio: policy.recommendedRatio,
    cropMode: policy.cropMode,
  };
}
