import type { Brand, BrandMode, BrandPaletteKey } from "@/lib/brand/types";

export type BrandThemePaletteId = BrandPaletteKey;
export type BrandThemeMode = BrandMode;
export type BrandPaletteSeedSource = "manual" | "logo" | "hero";

export type BrandPaletteSeedInput = {
  source: BrandPaletteSeedSource;
  primary: string;
  accent?: string;
  neutral?: string;
};

export type BrandPaletteSeed = {
  source: BrandPaletteSeedSource;
  primary: string;
  accent: string;
  neutral: string;
};

export type BrandHarmonyStrategy =
  | "monochromatic"
  | "analogous"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic";

export type BrandAccentStyle = "minimal" | "balanced" | "expressive";

export type BrandTypographyPreset = "editorial" | "modern" | "classic" | "geometric";

export type BrandThemeConfig = {
  paletteId: BrandThemePaletteId;
  mode: BrandThemeMode;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
};

export type ResolvedBrandThemeMode = Exclude<BrandThemeMode, "system">;

export type BrandCorePaletteTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  border: string;
  ring: string;
};

export type BrandSemanticTokens = BrandCorePaletteTokens & {
  secondary: string;
  secondaryForeground: string;

  accent: string;
  accentForeground: string;
  accentSoft: string;
  accentSoftForeground: string;
  accentStrong: string;
  accentStrongForeground: string;

  surface2: string;
  surface3: string;

  textSubtle: string;
  textInverse: string;

  ctaPrimary: string;
  ctaPrimaryForeground: string;
  ctaPrimaryHover: string;

  ctaSecondary: string;
  ctaSecondaryForeground: string;
  ctaSecondaryHover: string;

  badgeBg: string;
  badgeFg: string;

  heroOverlay: string;
  heroOverlayStrong: string;

  link: string;
  linkHover: string;

  typographyPreset: BrandTypographyPreset;
};

export type BrandThemePalettePreset = {
  id: BrandThemePaletteId;
  label: string;
  light: BrandCorePaletteTokens;
  dark: BrandCorePaletteTokens;
};

export type ResolveBrandThemeOptions = {
  systemModeFallback?: ResolvedBrandThemeMode;
};

export type BuildBrandThemeConfigOptions = Partial<
  Pick<BrandThemeConfig, "harmony" | "accentStyle" | "typographyPreset">
>;

export type ResolveBrandThemeFromBrandInput = {
  brand: Brand;
  options?: ResolveBrandThemeOptions;
  config?: BuildBrandThemeConfigOptions;
};
