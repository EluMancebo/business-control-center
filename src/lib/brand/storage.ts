// src/lib/brand/storage.ts
import type { Brand } from "./types";

export type BrandScope = "system" | "studio" | "panel" | "web";

// Base keys (v0)
export const STORAGE_KEY_BASE = "bcc.brand.v0";
export const BRAND_CHANNEL_BASE = "bcc:brand";

// Default “genérico” (compat)
export const DEFAULT_BRAND: Brand = {
  brandName: "Business Control Center",
  palette: "bcc",
  mode: "system",
};

// Defaults por scope (puedes ajustarlos si quieres)
const DEFAULT_BRAND_BY_SCOPE: Record<BrandScope, Brand> = {
  system: { ...DEFAULT_BRAND, palette: "bcc", mode: "light", brandName: "BCC · Taller" },
  studio: { ...DEFAULT_BRAND, palette: "bcc", mode: "system", brandName: "BCC · Studio" },
  panel: { ...DEFAULT_BRAND, palette: "bcc", mode: "system", brandName: "BCC · Panel" },
  web: { ...DEFAULT_BRAND, palette: "bcc", mode: "system", brandName: "BCC · Web" },
};

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function getDefaultBrandForScope(scope: BrandScope): Brand {
  return DEFAULT_BRAND_BY_SCOPE[scope] ?? DEFAULT_BRAND;
}

export function getBrandStorageKey(scope: BrandScope, businessSlug?: string): string {
  if (scope === "system") return `${STORAGE_KEY_BASE}.system`;
  if (scope === "studio") return `${STORAGE_KEY_BASE}.studio`;

  const slug = typeof businessSlug === "string" ? normalizeSlug(businessSlug) : "";
  if (slug) return `${STORAGE_KEY_BASE}.${scope}.${slug}`;

  return `${STORAGE_KEY_BASE}.${scope}`;
}

export function getBrandChannel(scope: BrandScope, businessSlug?: string): string {
  if (scope === "system") return `${BRAND_CHANNEL_BASE}:system`;
  if (scope === "studio") return `${BRAND_CHANNEL_BASE}:studio`;

  const slug = typeof businessSlug === "string" ? normalizeSlug(businessSlug) : "";
  if (slug) return `${BRAND_CHANNEL_BASE}:${scope}:${slug}`;

  return `${BRAND_CHANNEL_BASE}:${scope}`;
}

/**
 * Lee Brand desde localStorage usando un storageKey concreto.
 * Compat: si no existe el nuevo key, para "panel" intentamos el legacy STORAGE_KEY_BASE.
 */
export function loadBrandFromStorage(storageKey: string, fallback: Brand): Brand {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey);

    // Compat: migración suave desde clave antigua (antes todo usaba STORAGE_KEY_BASE)
        if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<Brand>;

    return {
      brandName:
        typeof parsed.brandName === "string" && parsed.brandName.trim().length > 0
          ? parsed.brandName
          : fallback.brandName,
      palette: (parsed.palette ?? fallback.palette) as Brand["palette"],
      mode: (parsed.mode ?? fallback.mode) as Brand["mode"],
    };
  } catch {
    return fallback;
  }
}

export function saveBrandToStorage(storageKey: string, brand: Brand): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(brand));
  } catch {
    // no rompemos UX
  }
}

