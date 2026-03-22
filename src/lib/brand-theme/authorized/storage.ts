import type { Layer2ThemeScope } from "./types";
import type {
  AuthorizedThemePreset,
  BusinessThemePolicy,
  Layer2ThemeSelection,
} from "./types";
import {
  createDefaultBusinessThemePolicy,
  normalizeBusinessSlug,
  normalizeBusinessThemePolicy,
  normalizeLayer2ThemeSelection,
} from "./model";

export const BUSINESS_THEME_POLICY_STORAGE_KEY_BASE = "bcc.brand-theme.policy.v1";
export const LAYER2_THEME_SELECTION_STORAGE_KEY_BASE = "bcc.brand-theme.selection.v1";

function resolveLocalStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  const maybe = (globalThis as { localStorage?: Storage }).localStorage;
  return maybe ?? null;
}

function normalizeScope(scope: Layer2ThemeScope): Layer2ThemeScope {
  return scope === "web" ? "web" : "panel";
}

function normalizeSlugOrFallback(input: string, fallback = "business"): string {
  return normalizeBusinessSlug(input) ?? fallback;
}

export function getBusinessThemePolicyStorageKey(
  scope: Layer2ThemeScope,
  businessSlug: string
): string {
  const safeScope = normalizeScope(scope);
  const slug = normalizeSlugOrFallback(businessSlug);
  return `${BUSINESS_THEME_POLICY_STORAGE_KEY_BASE}.${safeScope}.${slug}`;
}

export function getLayer2ThemeSelectionStorageKey(
  scope: Layer2ThemeScope,
  businessSlug: string
): string {
  const safeScope = normalizeScope(scope);
  const slug = normalizeSlugOrFallback(businessSlug);
  return `${LAYER2_THEME_SELECTION_STORAGE_KEY_BASE}.${safeScope}.${slug}`;
}

export function loadBusinessThemePolicy(
  scope: Layer2ThemeScope,
  businessSlug: string,
  presets?: AuthorizedThemePreset[]
): BusinessThemePolicy | null {
  const storage = resolveLocalStorage();
  if (!storage) return null;

  const key = getBusinessThemePolicyStorageKey(scope, businessSlug);
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return normalizeBusinessThemePolicy(parsed, {
      fallbackScope: scope,
      fallbackBusinessSlug: businessSlug,
      presets,
    });
  } catch {
    return null;
  }
}

export function loadOrCreateBusinessThemePolicy(
  scope: Layer2ThemeScope,
  businessSlug: string,
  presets?: AuthorizedThemePreset[]
): BusinessThemePolicy {
  const fromStorage = loadBusinessThemePolicy(scope, businessSlug, presets);
  if (fromStorage) return fromStorage;

  return createDefaultBusinessThemePolicy({
    scope,
    businessSlug,
    presets,
  });
}

export function saveBusinessThemePolicy(
  scope: Layer2ThemeScope,
  businessSlug: string,
  input: unknown,
  presets?: AuthorizedThemePreset[]
): BusinessThemePolicy | null {
  const storage = resolveLocalStorage();
  if (!storage) return null;

  const normalized = normalizeBusinessThemePolicy(input, {
    fallbackScope: scope,
    fallbackBusinessSlug: businessSlug,
    presets,
  });
  if (!normalized) return null;

  const key = getBusinessThemePolicyStorageKey(scope, businessSlug);
  try {
    storage.setItem(key, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function removeBusinessThemePolicy(
  scope: Layer2ThemeScope,
  businessSlug: string
): boolean {
  const storage = resolveLocalStorage();
  if (!storage) return false;

  const key = getBusinessThemePolicyStorageKey(scope, businessSlug);
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function loadLayer2ThemeSelection(
  scope: Layer2ThemeScope,
  businessSlug: string
): Layer2ThemeSelection | null {
  const storage = resolveLocalStorage();
  if (!storage) return null;

  const key = getLayer2ThemeSelectionStorageKey(scope, businessSlug);
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return normalizeLayer2ThemeSelection(parsed, {
      fallbackScope: scope,
      fallbackBusinessSlug: businessSlug,
    });
  } catch {
    return null;
  }
}

export function saveLayer2ThemeSelection(
  scope: Layer2ThemeScope,
  businessSlug: string,
  input: unknown
): Layer2ThemeSelection | null {
  const storage = resolveLocalStorage();
  if (!storage) return null;

  const normalized = normalizeLayer2ThemeSelection(input, {
    fallbackScope: scope,
    fallbackBusinessSlug: businessSlug,
  });
  if (!normalized) return null;

  const key = getLayer2ThemeSelectionStorageKey(scope, businessSlug);
  try {
    storage.setItem(key, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function removeLayer2ThemeSelection(
  scope: Layer2ThemeScope,
  businessSlug: string
): boolean {
  const storage = resolveLocalStorage();
  if (!storage) return false;

  const key = getLayer2ThemeSelectionStorageKey(scope, businessSlug);
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
