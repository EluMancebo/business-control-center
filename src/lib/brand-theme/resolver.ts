import type { Brand } from "@/lib/brand/types";
import { getBrandThemePalettePreset } from "./presets";
import { resolveBrandThemeTokensFromPaletteSeedWithMeta } from "./palette";
import { buildBrandSemanticTokens } from "./tokens";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandSemanticTokens,
  BrandTypographyPreset,
  BrandThemeConfig,
  BuildBrandThemeConfigOptions,
  ResolveBrandThemeFromBrandInput,
  ResolveBrandThemeOptions,
  ResolvedBrandThemeMode,
} from "./types";

export const DEFAULT_BRAND_THEME_CONFIG: Pick<
  BrandThemeConfig,
  "harmony" | "accentStyle" | "typographyPreset"
> = {
  harmony: "analogous",
  accentStyle: "balanced",
  typographyPreset: "modern",
};

export function resolveBrandThemeMode(
  mode: BrandThemeConfig["mode"],
  options?: ResolveBrandThemeOptions
): ResolvedBrandThemeMode {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return options?.systemModeFallback ?? "light";
}

export function buildBrandThemeConfigFromBrand(
  brand: Brand,
  overrides?: BuildBrandThemeConfigOptions
): BrandThemeConfig {
  return {
    paletteId: brand.palette,
    mode: brand.mode,
    harmony: overrides?.harmony ?? DEFAULT_BRAND_THEME_CONFIG.harmony,
    accentStyle: overrides?.accentStyle ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle,
    typographyPreset: overrides?.typographyPreset ?? DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
  };
}

export function resolveBrandThemeTokens(
  config: BrandThemeConfig,
  options?: ResolveBrandThemeOptions
) {
  const palette = getBrandThemePalettePreset(config.paletteId);
  const mode = resolveBrandThemeMode(config.mode, options);
  const core = mode === "dark" ? palette.dark : palette.light;
  const oppositeCore = mode === "dark" ? palette.light : palette.dark;

  return buildBrandSemanticTokens({
    core,
    oppositeCore,
    mode,
    harmony: config.harmony,
    accentStyle: config.accentStyle,
    typographyPreset: config.typographyPreset,
  });
}

export function resolveBrandThemeTokensFromBrand(input: ResolveBrandThemeFromBrandInput) {
  const config = buildBrandThemeConfigFromBrand(input.brand, input.config);
  return resolveBrandThemeTokens(config, input.options);
}

export type PersistedBrandPresetSemanticInput = {
  sourceMode: "manual" | "logo" | "hybrid";
  harmony?: BrandHarmonyStrategy;
  accentStyle?: BrandAccentStyle;
  typography?: BrandTypographyPreset;
  tokens: {
    primary: string;
    accent: string;
    neutral: string;
    background: string;
    card: string;
    surface2: string;
    surface3: string;
    link: string;
    border: string;
  };
};

export function resolveBrandPresetToSemanticTokens(
  input: PersistedBrandPresetSemanticInput,
  options?: {
    mode?: "light" | "dark" | "system";
    runtime?: ResolveBrandThemeOptions;
  }
): BrandSemanticTokens | null {
  const resolved = resolveBrandThemeTokensFromPaletteSeedWithMeta({
    seed: {
      source: input.sourceMode === "manual" ? "manual" : "logo",
      primary: input.tokens.primary,
      accent: input.tokens.accent,
      neutral: input.tokens.neutral,
    },
    mode: options?.mode ?? "system",
    config: {
      harmony: input.harmony ?? DEFAULT_BRAND_THEME_CONFIG.harmony,
      accentStyle: input.accentStyle ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle,
      typographyPreset: input.typography ?? DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
    },
    options: options?.runtime,
  });
  if (!resolved) return null;

  return {
    ...resolved.tokens,
    primary: input.tokens.primary,
    accent: input.tokens.accent,
    background: input.tokens.background,
    card: input.tokens.card,
    surface2: input.tokens.surface2,
    surface3: input.tokens.surface3,
    link: input.tokens.link,
    border: input.tokens.border,
    typographyPreset: input.typography ?? resolved.tokens.typographyPreset,
  };
}
