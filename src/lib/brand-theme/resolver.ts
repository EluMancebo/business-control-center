import type { Brand } from "@/lib/brand/types";
import { getBrandThemePalettePreset } from "./presets";
import { buildBrandSemanticTokens } from "./tokens";
import type {
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
