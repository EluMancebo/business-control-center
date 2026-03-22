import type { Brand, BrandMode, BrandPaletteKey } from "@/lib/brand/types";
import { getDefaultBrandForScope, type BrandScope } from "@/lib/brand/storage";
import { normalizeHexColor } from "../palette";
import {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
} from "../presets";
import { DEFAULT_BRAND_THEME_CONFIG } from "../resolver";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandPaletteSeedSource,
  BrandTypographyPreset,
} from "../types";

export const BRAND_THEME_STATE_V1_SCHEMA_VERSION = 1 as const;
export const DEFAULT_BRAND_THEME_STATE_V1_MODULATION_PERCENT = 26;
export const DEFAULT_BRAND_THEME_AUTO_STRATEGY = "derive-from-primary" as const;

export type BrandThemeAutoStrategy = "derive-from-primary" | "derive-from-source";

export type BrandThemeSeedColorAuto = {
  mode: "auto";
  strategy: BrandThemeAutoStrategy;
};

export type BrandThemeSeedColorManual = {
  mode: "manual";
  value: string;
};

export type BrandThemeSeedColor = BrandThemeSeedColorAuto | BrandThemeSeedColorManual;

export type BrandThemeStateV1Legacy = Pick<Brand, "brandName" | "palette" | "mode">;

export type BrandThemeStateV1SourceRef = {
  assetId?: string;
  imageUrl?: string;
};

export type BrandThemeStateV1Seed = {
  source: BrandPaletteSeedSource;
  primary: string;
  accent: BrandThemeSeedColor;
  neutral: BrandThemeSeedColor;
  sourceRef?: BrandThemeStateV1SourceRef;
};

export type BrandThemeStateV1Config = {
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
  presetModulationPercent: number;
};

export type BrandThemeStateV1Meta = {
  updatedAt: string;
  updatedBy?: string;
};

export type BrandThemeStateV1 = {
  schemaVersion: typeof BRAND_THEME_STATE_V1_SCHEMA_VERSION;
  scope: BrandScope;
  businessSlug?: string;
  legacy: BrandThemeStateV1Legacy;
  seed: BrandThemeStateV1Seed;
  config: BrandThemeStateV1Config;
  meta?: BrandThemeStateV1Meta;
};

export type NormalizeBrandThemeStateV1Options = {
  fallbackScope?: BrandScope;
  fallbackBusinessSlug?: string;
};

const PALETTE_KEYS: BrandPaletteKey[] = ["bcc", "ocean", "sunset", "mono"];
const BRAND_MODES: BrandMode[] = ["light", "dark", "system"];
const SEED_SOURCES: BrandPaletteSeedSource[] = ["manual", "logo", "hero"];
const STATE_SCOPES: BrandScope[] = ["system", "studio", "panel", "web"];
const AUTO_STRATEGIES: BrandThemeAutoStrategy[] = [
  "derive-from-primary",
  "derive-from-source",
];

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

function asNonEmptyString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim();
  return value.length > 0 ? value : null;
}

function asOptionalString(input: unknown): string | undefined {
  return asNonEmptyString(input) ?? undefined;
}

function asScope(input: unknown): BrandScope | null {
  if (typeof input !== "string") return null;
  return STATE_SCOPES.includes(input as BrandScope) ? (input as BrandScope) : null;
}

function asPaletteKey(input: unknown): BrandPaletteKey | null {
  if (typeof input !== "string") return null;
  return PALETTE_KEYS.includes(input as BrandPaletteKey) ? (input as BrandPaletteKey) : null;
}

function asBrandMode(input: unknown): BrandMode | null {
  if (typeof input !== "string") return null;
  return BRAND_MODES.includes(input as BrandMode) ? (input as BrandMode) : null;
}

function asSeedSource(input: unknown): BrandPaletteSeedSource | null {
  if (typeof input !== "string") return null;
  return SEED_SOURCES.includes(input as BrandPaletteSeedSource)
    ? (input as BrandPaletteSeedSource)
    : null;
}

function asHarmony(input: unknown): BrandHarmonyStrategy | null {
  if (typeof input !== "string") return null;
  return BRAND_THEME_HARMONY_OPTIONS.includes(input as BrandHarmonyStrategy)
    ? (input as BrandHarmonyStrategy)
    : null;
}

function asAccentStyle(input: unknown): BrandAccentStyle | null {
  if (typeof input !== "string") return null;
  return BRAND_THEME_ACCENT_STYLE_OPTIONS.includes(input as BrandAccentStyle)
    ? (input as BrandAccentStyle)
    : null;
}

function asTypographyPreset(input: unknown): BrandTypographyPreset | null {
  if (typeof input !== "string") return null;
  return BRAND_THEME_TYPOGRAPHY_OPTIONS.includes(input as BrandTypographyPreset)
    ? (input as BrandTypographyPreset)
    : null;
}

function asAutoStrategy(input: unknown): BrandThemeAutoStrategy | null {
  if (typeof input !== "string") return null;
  return AUTO_STRATEGIES.includes(input as BrandThemeAutoStrategy)
    ? (input as BrandThemeAutoStrategy)
    : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeModulationPercent(input: unknown): number {
  if (typeof input !== "number" || !Number.isFinite(input)) {
    return DEFAULT_BRAND_THEME_STATE_V1_MODULATION_PERCENT;
  }
  return clamp(Math.round(input), 0, 100);
}

export function createBrandThemeSeedColorAuto(
  strategy: BrandThemeAutoStrategy = DEFAULT_BRAND_THEME_AUTO_STRATEGY
): BrandThemeSeedColorAuto {
  const normalized = asAutoStrategy(strategy) ?? DEFAULT_BRAND_THEME_AUTO_STRATEGY;
  return { mode: "auto", strategy: normalized };
}

export function createBrandThemeSeedColorManual(value: string): BrandThemeSeedColorManual | null {
  const normalized = normalizeHexColor(value);
  if (!normalized) return null;
  return { mode: "manual", value: normalized };
}

export function isBrandThemeSeedColorAuto(input: unknown): input is BrandThemeSeedColorAuto {
  if (!isRecord(input)) return false;
  return (
    input.mode === "auto" &&
    typeof input.strategy === "string" &&
    AUTO_STRATEGIES.includes(input.strategy as BrandThemeAutoStrategy)
  );
}

export function isBrandThemeSeedColorManual(input: unknown): input is BrandThemeSeedColorManual {
  if (!isRecord(input)) return false;
  if (input.mode !== "manual" || typeof input.value !== "string") return false;
  return Boolean(normalizeHexColor(input.value));
}

export function isBrandThemeSeedColor(input: unknown): input is BrandThemeSeedColor {
  return isBrandThemeSeedColorAuto(input) || isBrandThemeSeedColorManual(input);
}

function normalizeSeedColor(input: unknown): BrandThemeSeedColor {
  if (isBrandThemeSeedColorManual(input)) {
    return { mode: "manual", value: normalizeHexColor(input.value)! };
  }

  if (isBrandThemeSeedColorAuto(input)) {
    return {
      mode: "auto",
      strategy: asAutoStrategy(input.strategy) ?? DEFAULT_BRAND_THEME_AUTO_STRATEGY,
    };
  }

  if (typeof input === "string") {
    const manual = createBrandThemeSeedColorManual(input);
    if (manual) return manual;
  }

  return createBrandThemeSeedColorAuto();
}

function normalizeSourceRef(input: unknown): BrandThemeStateV1SourceRef | undefined {
  if (!isRecord(input)) return undefined;
  const assetId = asOptionalString(input.assetId);
  const imageUrl = asOptionalString(input.imageUrl);
  if (!assetId && !imageUrl) return undefined;
  return { assetId, imageUrl };
}

function normalizeMeta(input: unknown): BrandThemeStateV1Meta | undefined {
  if (!isRecord(input)) return undefined;
  const updatedAt = asNonEmptyString(input.updatedAt);
  if (!updatedAt) return undefined;
  const updatedBy = asOptionalString(input.updatedBy);
  return { updatedAt, updatedBy };
}

function normalizeLegacy(
  input: unknown,
  scope: BrandScope
): BrandThemeStateV1Legacy {
  const fallback = getDefaultBrandForScope(scope);
  const record = isRecord(input) ? input : {};

  return {
    brandName: asNonEmptyString(record.brandName) ?? fallback.brandName,
    palette: asPaletteKey(record.palette) ?? fallback.palette,
    mode: asBrandMode(record.mode) ?? fallback.mode,
  };
}

function normalizeSeed(input: unknown): BrandThemeStateV1Seed {
  const record = isRecord(input) ? input : {};
  return {
    source: asSeedSource(record.source) ?? "manual",
    primary: normalizeHexColor(typeof record.primary === "string" ? record.primary : "") ?? "#2563eb",
    accent: normalizeSeedColor(record.accent),
    neutral: normalizeSeedColor(record.neutral),
    sourceRef: normalizeSourceRef(record.sourceRef),
  };
}

function normalizeConfig(input: unknown): BrandThemeStateV1Config {
  const record = isRecord(input) ? input : {};

  return {
    harmony: asHarmony(record.harmony) ?? DEFAULT_BRAND_THEME_CONFIG.harmony,
    accentStyle: asAccentStyle(record.accentStyle) ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle,
    typographyPreset:
      asTypographyPreset(record.typographyPreset) ??
      DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
    presetModulationPercent: normalizeModulationPercent(record.presetModulationPercent),
  };
}

export function createDefaultBrandThemeStateV1(
  scope: BrandScope,
  businessSlug?: string
): BrandThemeStateV1 {
  const fallback = getDefaultBrandForScope(scope);
  const normalizedSlug = asOptionalString(businessSlug);

  return {
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope,
    businessSlug: normalizedSlug,
    legacy: {
      brandName: fallback.brandName,
      palette: fallback.palette,
      mode: fallback.mode,
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: createBrandThemeSeedColorAuto(),
      neutral: createBrandThemeSeedColorAuto(),
    },
    config: {
      harmony: DEFAULT_BRAND_THEME_CONFIG.harmony,
      accentStyle: DEFAULT_BRAND_THEME_CONFIG.accentStyle,
      typographyPreset: DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
      presetModulationPercent: DEFAULT_BRAND_THEME_STATE_V1_MODULATION_PERCENT,
    },
  };
}

export function normalizeBrandThemeStateV1(
  input: unknown,
  options?: NormalizeBrandThemeStateV1Options
): BrandThemeStateV1 | null {
  if (!isRecord(input)) return null;

  if (input.schemaVersion !== BRAND_THEME_STATE_V1_SCHEMA_VERSION) return null;

  const scope = asScope(input.scope) ?? asScope(options?.fallbackScope);
  if (!scope) return null;

  const businessSlug = asOptionalString(input.businessSlug) ?? asOptionalString(options?.fallbackBusinessSlug);

  return {
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope,
    businessSlug,
    legacy: normalizeLegacy(input.legacy, scope),
    seed: normalizeSeed(input.seed),
    config: normalizeConfig(input.config),
    meta: normalizeMeta(input.meta),
  };
}

export function parseBrandThemeStateV1(
  raw: string,
  options?: NormalizeBrandThemeStateV1Options
): BrandThemeStateV1 | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeBrandThemeStateV1(parsed, options);
  } catch {
    return null;
  }
}

export function stringifyBrandThemeStateV1(input: BrandThemeStateV1): string {
  return JSON.stringify(input);
}

