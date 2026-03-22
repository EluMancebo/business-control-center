import type { Brand } from "@/lib/brand/types";
import { resolveBrandThemeTokensFromPaletteSeedWithMeta } from "./palette";
import { getBrandThemePalettePreset } from "./presets";
import { resolveBrandThemeMode, resolveBrandThemeTokensFromBrand } from "./resolver";
import { toBrandCssVariables } from "./tokens";
import type {
  BrandCorePaletteTokens,
  BrandPaletteSeed,
  BrandPaletteSeedInput,
  BrandSemanticTokens,
  BrandThemePalettePreset,
  BrandTypographyPreset,
  ResolveBrandThemeOptions,
  ResolvedBrandThemeMode,
} from "./types";
import type { NormalizeBrandThemeStateV1Options } from "./state/v1";
import { normalizeBrandThemeStateV1, type BrandThemeStateV1 } from "./state/v1";

export type BrandThemePipelineSource = "palette-seed" | "brand-fallback";

export type BrandThemePipelineResult = {
  state: BrandThemeStateV1;
  brand: Brand;
  seedInput: BrandPaletteSeedInput;
  normalizedSeed: BrandPaletteSeed | null;
  normalizedSeedBase: BrandPaletteSeed | null;
  seedAccentSource: "explicit-blend" | "derived" | null;
  source: BrandThemePipelineSource;
  resolvedMode: ResolvedBrandThemeMode;
  preset: BrandThemePalettePreset;
  presetCore: BrandCorePaletteTokens;
  semanticTokensBase: BrandSemanticTokens;
  semanticTokens: BrandSemanticTokens;
  cssVariables: Record<string, string>;
};

export type ResolveBrandThemePipelineOptions = NormalizeBrandThemeStateV1Options &
  ResolveBrandThemeOptions & {
    applyPresetModulation?: boolean;
    includeTypographyVariables?: boolean;
  };

const TYPOGRAPHY_FONT_STACK: Record<BrandTypographyPreset, string> = {
  editorial: "Georgia, Cambria, 'Times New Roman', Times, serif",
  modern:
    "var(--font-geist-sans), system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  classic: "'Trebuchet MS', 'Segoe UI', Tahoma, Arial, sans-serif",
  geometric:
    "'Avenir Next', Avenir, 'Century Gothic', Montserrat, var(--font-geist-sans), sans-serif",
};

type RGB = { r: number; g: number; b: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseColor(input: string): RGB | null {
  const value = input.trim().toLowerCase();
  const rgbMatch = value.match(
    /^rgba?\(\s*([0-9]+)[,\s]+([0-9]+)[,\s]+([0-9]+)(?:[,\s/]+([0-9.]+))?\s*\)$/
  );

  if (rgbMatch) {
    return {
      r: clamp(Number(rgbMatch[1]), 0, 255),
      g: clamp(Number(rgbMatch[2]), 0, 255),
      b: clamp(Number(rgbMatch[3]), 0, 255),
    };
  }

  if (!value.startsWith("#")) return null;
  const hex = value.slice(1);

  if (/^[0-9a-f]{3}$/.test(hex)) {
    return {
      r: parseInt(`${hex[0]}${hex[0]}`, 16),
      g: parseInt(`${hex[1]}${hex[1]}`, 16),
      b: parseInt(`${hex[2]}${hex[2]}`, 16),
    };
  }

  if (/^[0-9a-f]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

function rgbToHex(input: RGB): string {
  const toHex = (value: number) =>
    clamp(Math.round(value), 0, 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(input.r)}${toHex(input.g)}${toHex(input.b)}`;
}

function mixColor(a: string, b: string, ratio: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;

  const w = clamp(ratio, 0, 1);
  return rgbToHex({
    r: ca.r * (1 - w) + cb.r * w,
    g: ca.g * (1 - w) + cb.g * w,
    b: ca.b * (1 - w) + cb.b * w,
  });
}

function modulateTokensWithPreset(args: {
  tokens: BrandSemanticTokens;
  presetCore: BrandCorePaletteTokens;
  modulationPercent: number;
}): BrandSemanticTokens {
  const ratio = clamp(args.modulationPercent / 100, 0, 0.42);
  if (ratio <= 0) return args.tokens;

  const { tokens, presetCore } = args;
  const atmosphereBase = mixColor(presetCore.muted, presetCore.primary, 0.32);
  const surfaceRatio = clamp(ratio * 1.22, 0, 0.5);
  const softRatio = clamp(ratio * 0.52, 0, 0.24);
  const ringRatio = clamp(ratio * 0.62, 0, 0.3);
  const linkHoverRatio = clamp(ratio * 0.36, 0, 0.2);
  const accentSoft = mixColor(tokens.accentSoft, atmosphereBase, softRatio);

  return {
    ...tokens,
    background: mixColor(tokens.background, presetCore.background, surfaceRatio),
    card: mixColor(tokens.card, presetCore.card, surfaceRatio * 0.9),
    muted: mixColor(tokens.muted, presetCore.muted, surfaceRatio),
    surface2: mixColor(tokens.surface2, atmosphereBase, surfaceRatio),
    surface3: mixColor(tokens.surface3, atmosphereBase, surfaceRatio * 0.9),
    border: mixColor(tokens.border, presetCore.border, ratio * 0.6),
    ring: mixColor(tokens.ring, presetCore.primary, ringRatio),
    accentSoft,
    badgeBg: accentSoft,
    linkHover: mixColor(tokens.linkHover, presetCore.primary, linkHoverRatio),
  };
}

function seedColorToInputValue(
  input: BrandThemeStateV1["seed"]["accent"] | BrandThemeStateV1["seed"]["neutral"]
): string {
  return input.mode === "manual" ? input.value : "";
}

function buildBrandFromState(state: BrandThemeStateV1): Brand {
  return {
    brandName: state.legacy.brandName,
    palette: state.legacy.palette,
    mode: state.legacy.mode,
  };
}

function buildSeedInputFromState(state: BrandThemeStateV1): BrandPaletteSeedInput {
  return {
    source: state.seed.source,
    primary: state.seed.primary,
    accent: seedColorToInputValue(state.seed.accent),
    neutral: seedColorToInputValue(state.seed.neutral),
  };
}

export function resolveBrandThemePipelineFromStateV1(
  input: unknown,
  options?: ResolveBrandThemePipelineOptions
): BrandThemePipelineResult | null {
  const state = normalizeBrandThemeStateV1(input, options);
  if (!state) return null;

  const brand = buildBrandFromState(state);
  const seedInput = buildSeedInputFromState(state);
  const resolveOptions: ResolveBrandThemeOptions = {
    systemModeFallback: options?.systemModeFallback,
  };

  const fromSeed = resolveBrandThemeTokensFromPaletteSeedWithMeta({
    seed: seedInput,
    mode: brand.mode,
    config: {
      harmony: state.config.harmony,
      accentStyle: state.config.accentStyle,
      typographyPreset: state.config.typographyPreset,
    },
    options: resolveOptions,
  });

  const fallbackFromBrand = resolveBrandThemeTokensFromBrand({
    brand,
    config: {
      harmony: state.config.harmony,
      accentStyle: state.config.accentStyle,
      typographyPreset: state.config.typographyPreset,
    },
    options: resolveOptions,
  });

  const source: BrandThemePipelineSource = fromSeed ? "palette-seed" : "brand-fallback";
  const semanticTokensBase = fromSeed?.tokens ?? fallbackFromBrand;
  const normalizedSeed = fromSeed?.resolvedSeed ?? null;
  const normalizedSeedBase = fromSeed?.normalizedSeed ?? null;
  const seedAccentSource = fromSeed?.accentSource ?? null;
  const resolvedMode = resolveBrandThemeMode(brand.mode, resolveOptions);
  const preset = getBrandThemePalettePreset(brand.palette);
  const presetCore = resolvedMode === "dark" ? preset.dark : preset.light;

  const semanticTokens =
    options?.applyPresetModulation === false
      ? semanticTokensBase
      : modulateTokensWithPreset({
          tokens: semanticTokensBase,
          presetCore,
          modulationPercent: state.config.presetModulationPercent,
        });

  const cssVariables = toBrandCssVariables(semanticTokens);

  if (options?.includeTypographyVariables !== false) {
    cssVariables["--brand-typography-preset"] = semanticTokens.typographyPreset;
    cssVariables["--font-sans"] = TYPOGRAPHY_FONT_STACK[semanticTokens.typographyPreset];
  }

  return {
    state,
    brand,
    seedInput,
    normalizedSeed,
    normalizedSeedBase,
    seedAccentSource,
    source,
    resolvedMode,
    preset,
    presetCore,
    semanticTokensBase,
    semanticTokens,
    cssVariables,
  };
}
