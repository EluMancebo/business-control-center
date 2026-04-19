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
  resolveBrandPaletteSeedWithHarmony,
  resolveBrandThemeTokensFromPaletteSeed,
  resolveBrandThemeTokensFromPaletteSeedWithMeta,
} from "./palette";
export type {
  BrandPaletteSeedResolution,
  ResolveBrandThemeTokensFromPaletteSeedWithMetaResult,
} from "./palette";
export { applyBrandThemePreviewToDocument } from "./applyPreviewTheme";
export type { ApplyBrandThemePreviewInput } from "./applyPreviewTheme";
export {
  resolveBrandThemePipelineFromStateV1,
} from "./pipeline";
export type {
  BrandThemePipelineResult,
  BrandThemePipelineSource,
  ResolveBrandThemePipelineOptions,
} from "./pipeline";

export {
  DEFAULT_BRAND_THEME_CONFIG,
  buildBrandThemeConfigFromBrand,
  resolveBrandPresetToSemanticTokens,
  resolveBrandThemeMode,
  resolveBrandThemeTokens,
  resolveBrandThemeTokensFromBrand,
} from "./resolver";
export type { PersistedBrandPresetSemanticInput } from "./resolver";

export type {
  ExtractedColorCandidate,
  ExtractedPaletteProposal,
  ExtractedPaletteResult,
  ExtractPaletteFromImageOptions,
} from "./extraction";
export {
  buildPaletteProposalFromCandidates,
  extractPaletteFromImageUrl,
} from "./extraction";

export * from "./authorized";
