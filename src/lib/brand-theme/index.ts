export type {
  BrandPaletteSeed,
  BrandPaletteSeedInput,
  BrandPaletteSeedSource,
  BrandAccentStyle,
  BrandCorePaletteTokens,
  BrandHarmonyStrategy,
  BrandSemanticTokens,
  BrandThemeConfig,
  BrandThemeMode,
  BrandThemePaletteId,
  BrandThemePalettePreset,
  BrandTypographyPreset,
  BuildBrandThemeConfigOptions,
  ResolveBrandThemeFromBrandInput,
  ResolveBrandThemeOptions,
  ResolvedBrandThemeMode,
} from "./types";

export {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_PALETTES,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
  getBrandThemePalettePreset,
} from "./presets";

export { buildBrandSemanticTokens, toBrandCssVariables } from "./tokens";
export {
  normalizeBrandPaletteSeed,
  normalizeHexColor,
  resolveBrandThemeTokensFromPaletteSeed,
} from "./palette";
export { applyBrandThemePreviewToDocument } from "./applyPreviewTheme";
export type { ApplyBrandThemePreviewInput } from "./applyPreviewTheme";

export {
  DEFAULT_BRAND_THEME_CONFIG,
  buildBrandThemeConfigFromBrand,
  resolveBrandThemeMode,
  resolveBrandThemeTokens,
  resolveBrandThemeTokensFromBrand,
} from "./resolver";
