import type { BrandScope } from "@/lib/brand/storage";
import {
  type BrandThemeStateV1,
  normalizeBrandThemeStateV1,
  parseBrandThemeStateV1,
  stringifyBrandThemeStateV1,
} from "./v1";

export const BRAND_THEME_STATE_V1_STORAGE_KEY_BASE = "bcc.brand-theme.v1";

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function resolveLocalStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  const maybeStorage = (globalThis as { localStorage?: Storage }).localStorage;
  return maybeStorage ?? null;
}

export function getBrandThemeStateStorageKeyV1(
  scope: BrandScope,
  businessSlug?: string
): string {
  if (scope === "system") return `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.system`;
  if (scope === "studio") return `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.studio`;

  const slug = typeof businessSlug === "string" ? normalizeSlug(businessSlug) : "";
  if (slug) return `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.${scope}.${slug}`;
  return `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.${scope}`;
}

export function loadBrandThemeStateV1(
  scope: BrandScope,
  businessSlug?: string
): BrandThemeStateV1 | null {
  const storage = resolveLocalStorage();
  if (!storage) return null;

  const storageKey = getBrandThemeStateStorageKeyV1(scope, businessSlug);

  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return null;
    return parseBrandThemeStateV1(raw, {
      fallbackScope: scope,
      fallbackBusinessSlug: businessSlug,
    });
  } catch {
    return null;
  }
}

export function saveBrandThemeStateV1(
  scope: BrandScope,
  input: unknown,
  businessSlug?: string
): BrandThemeStateV1 | null {
  const storage = resolveLocalStorage();
  if (!storage) return null;

  const normalized = normalizeBrandThemeStateV1(input, {
    fallbackScope: scope,
    fallbackBusinessSlug: businessSlug,
  });
  if (!normalized) return null;

  const storageKey = getBrandThemeStateStorageKeyV1(scope, businessSlug);

  try {
    storage.setItem(storageKey, stringifyBrandThemeStateV1(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function removeBrandThemeStateV1(
  scope: BrandScope,
  businessSlug?: string
): boolean {
  const storage = resolveLocalStorage();
  if (!storage) return false;

  const storageKey = getBrandThemeStateStorageKeyV1(scope, businessSlug);

  try {
    storage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}

