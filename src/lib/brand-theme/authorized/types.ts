import type { BrandMode, BrandPaletteKey } from "@/lib/brand/types";
import type { BrandScope } from "@/lib/brand/storage";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandTypographyPreset,
} from "../types";

export const AUTHORIZED_THEME_PRESET_SCHEMA_VERSION = 1 as const;
export const BUSINESS_THEME_POLICY_SCHEMA_VERSION = 1 as const;
export const LAYER2_THEME_SELECTION_SCHEMA_VERSION = 1 as const;

export type Layer2ThemeScope = Extract<BrandScope, "panel" | "web">;
export type AuthorizedThemePresetStatus = "active" | "archived";
export type Layer2ThemeSelectionStage = "draft" | "published";

export type Layer2ThemeAdjustableField =
  | "mode"
  | "harmony"
  | "accentStyle"
  | "typographyPreset"
  | "presetModulationPercent";

export const LAYER2_THEME_SCOPES: Layer2ThemeScope[] = ["panel", "web"];
export const LAYER2_THEME_ADJUSTABLE_FIELDS: Layer2ThemeAdjustableField[] = [
  "mode",
  "harmony",
  "accentStyle",
  "typographyPreset",
  "presetModulationPercent",
];

export type AuthorizedThemePresetThemeBase = {
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
  presetModulationPercent: number;
};

export type AuthorizedThemePreset = {
  schemaVersion: typeof AUTHORIZED_THEME_PRESET_SCHEMA_VERSION;
  id: string;
  label: string;
  scope: Layer2ThemeScope;
  status: AuthorizedThemePresetStatus;
  description?: string;
  legacyBase: {
    palette: BrandPaletteKey;
    mode: BrandMode;
  };
  themeBase: AuthorizedThemePresetThemeBase;
  limits?: {
    minModulationPercent?: number;
    maxModulationPercent?: number;
    heroPresetKeys?: string[];
  };
};

export type BusinessThemePolicy = {
  schemaVersion: typeof BUSINESS_THEME_POLICY_SCHEMA_VERSION;
  businessSlug: string;
  scope: Layer2ThemeScope;
  allowedPresetIds: string[];
  defaultPresetId?: string;
  adjustableFields: Layer2ThemeAdjustableField[];
  heroPolicy?: {
    allowedPresetKeys?: string[];
    defaultPresetKey?: string;
  };
  updatedAt?: string;
  updatedBy?: string;
};

export type Layer2ThemeOverrides = Partial<{
  mode: BrandMode;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
  presetModulationPercent: number;
}>;

export type Layer2ThemeSnapshot = {
  presetId: string;
  overrides?: Layer2ThemeOverrides;
  heroPresetKey?: string;
};

export type Layer2ThemeSelection = {
  schemaVersion: typeof LAYER2_THEME_SELECTION_SCHEMA_VERSION;
  businessSlug: string;
  scope: Layer2ThemeScope;
  draft: Layer2ThemeSnapshot;
  published?: Layer2ThemeSnapshot;
  updatedAt?: string;
  updatedBy?: string;
};
