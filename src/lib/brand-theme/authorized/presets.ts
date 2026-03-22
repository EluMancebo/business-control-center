import type { AuthorizedThemePreset, Layer2ThemeScope } from "./types";
import { AUTHORIZED_THEME_PRESET_SCHEMA_VERSION } from "./types";

export const SYSTEM_AUTHORIZED_THEME_PRESETS: AuthorizedThemePreset[] = [
  {
    schemaVersion: AUTHORIZED_THEME_PRESET_SCHEMA_VERSION,
    id: "panel-balanced-default",
    label: "Panel · Balanced",
    scope: "panel",
    status: "active",
    description: "Preset base para panel: estable, limpio y de bajo riesgo.",
    legacyBase: {
      palette: "bcc",
      mode: "system",
    },
    themeBase: {
      harmony: "analogous",
      accentStyle: "balanced",
      typographyPreset: "modern",
      presetModulationPercent: 22,
    },
  },
  {
    schemaVersion: AUTHORIZED_THEME_PRESET_SCHEMA_VERSION,
    id: "panel-contrast-focus",
    label: "Panel · Contrast Focus",
    scope: "panel",
    status: "active",
    description: "Mayor separación visual para paneles con alta densidad de datos.",
    legacyBase: {
      palette: "mono",
      mode: "dark",
    },
    themeBase: {
      harmony: "monochromatic",
      accentStyle: "minimal",
      typographyPreset: "modern",
      presetModulationPercent: 18,
    },
    limits: {
      minModulationPercent: 8,
      maxModulationPercent: 36,
    },
  },
  {
    schemaVersion: AUTHORIZED_THEME_PRESET_SCHEMA_VERSION,
    id: "web-brand-balanced",
    label: "Web · Brand Balanced",
    scope: "web",
    status: "active",
    description: "Preset de identidad equilibrada para sitios de negocio local.",
    legacyBase: {
      palette: "bcc",
      mode: "light",
    },
    themeBase: {
      harmony: "analogous",
      accentStyle: "balanced",
      typographyPreset: "modern",
      presetModulationPercent: 24,
    },
    limits: {
      minModulationPercent: 12,
      maxModulationPercent: 44,
      heroPresetKeys: ["hero-classic", "hero-split-media", "hero-minimal-cta"],
    },
  },
  {
    schemaVersion: AUTHORIZED_THEME_PRESET_SCHEMA_VERSION,
    id: "web-campaign-expressive",
    label: "Web · Campaign Expressive",
    scope: "web",
    status: "active",
    description: "Mayor energía para campañas, promociones y landings estacionales.",
    legacyBase: {
      palette: "sunset",
      mode: "light",
    },
    themeBase: {
      harmony: "complementary",
      accentStyle: "expressive",
      typographyPreset: "geometric",
      presetModulationPercent: 32,
    },
    limits: {
      minModulationPercent: 20,
      maxModulationPercent: 60,
      heroPresetKeys: ["hero-campaign", "hero-split-media"],
    },
  },
];

export function listAuthorizedThemePresets(scope?: Layer2ThemeScope): AuthorizedThemePreset[] {
  if (!scope) return [...SYSTEM_AUTHORIZED_THEME_PRESETS];
  return SYSTEM_AUTHORIZED_THEME_PRESETS.filter((preset) => preset.scope === scope);
}

export function getAuthorizedThemePresetById(id: string): AuthorizedThemePreset | null {
  const value = id.trim();
  if (!value) return null;
  return SYSTEM_AUTHORIZED_THEME_PRESETS.find((preset) => preset.id === value) ?? null;
}
