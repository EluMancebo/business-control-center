import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandPresetVaultTokens,
  BrandTypographyPreset,
} from "@/lib/brand-theme";

export type HeroDraftInput = {
  palette: BrandPresetVaultTokens;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typography?: BrandTypographyPreset;
};
