import { DEFAULT_BRAND_THEME_CONFIG } from "./resolver";
import { buildBrandSemanticTokens } from "./tokens";
import type {
  BrandCorePaletteTokens,
  BrandHarmonyStrategy,
  BrandPaletteSeed,
  BrandPaletteSeedInput,
  BuildBrandThemeConfigOptions,
  ResolveBrandThemeOptions,
  ResolvedBrandThemeMode,
} from "./types";

type RGB = { r: number; g: number; b: number };

const HARMONY_HUE_SHIFT: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 0,
  analogous: 30,
  complementary: 180,
  "split-complementary": 150,
  triadic: 120,
  tetradic: 90,
};

const HARMONY_ACCENT_SATURATION_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: -12,
  analogous: -4,
  complementary: 12,
  "split-complementary": 8,
  triadic: 10,
  tetradic: 16,
};

const HARMONY_ACCENT_LIGHTNESS_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 2,
  analogous: 0,
  complementary: -2,
  "split-complementary": -1,
  triadic: -1,
  tetradic: -2,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHexColor(input: string): string | null {
  const value = input.trim().toLowerCase();
  if (!value.startsWith("#")) return null;

  const hex = value.slice(1);
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  if (/^[0-9a-f]{6}$/.test(hex)) {
    return `#${hex}`;
  }

  return null;
}

function hexToRgb(input: string): RGB | null {
  const normalized = normalizeHexColor(input);
  if (!normalized) return null;

  const value = normalized.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function toRgba(input: string, alpha: number): string {
  const rgb = hexToRgb(input);
  if (!rgb) return `rgba(15, 23, 42, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`;
}

function mixHexColors(baseColor: string, targetColor: string, ratio: number): string {
  const a = hexToRgb(baseColor);
  const b = hexToRgb(targetColor);
  if (!a || !b) return baseColor;

  const weight = clamp(ratio, 0, 1);
  return rgbToHex({
    r: a.r * (1 - weight) + b.r * weight,
    g: a.g * (1 - weight) + b.g * weight,
    b: a.b * (1 - weight) + b.b * weight,
  });
}

function rgbToHsl(rgb: RGB): { h: number; s: number; l: number } {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: (h + 360) % 360,
    s: s * 100,
    l: l * 100,
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const normalizedH = ((h % 360) + 360) % 360;
  const normalizedS = clamp(s, 0, 100) / 100;
  const normalizedL = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * normalizedL - 1)) * normalizedS;
  const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
  const m = normalizedL - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (normalizedH < 60) {
    r1 = c;
    g1 = x;
  } else if (normalizedH < 120) {
    r1 = x;
    g1 = c;
  } else if (normalizedH < 180) {
    g1 = c;
    b1 = x;
  } else if (normalizedH < 240) {
    g1 = x;
    b1 = c;
  } else if (normalizedH < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return {
    r: (r1 + m) * 255,
    g: (g1 + m) * 255,
    b: (b1 + m) * 255,
  };
}

function transformHexHsl(
  baseColor: string,
  transform: (hsl: { h: number; s: number; l: number }) => { h: number; s: number; l: number }
): string {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return baseColor;

  const hsl = rgbToHsl(rgb);
  const next = transform(hsl);
  return rgbToHex(hslToRgb(next.h, next.s, next.l));
}

function getReadableForeground(background: string, darkText = "#0f172a", lightText = "#ffffff"): string {
  const rgb = hexToRgb(background);
  if (!rgb) return lightText;
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.58 ? darkText : lightText;
}

function deriveAccent(primary: string, harmony: BrandHarmonyStrategy): string {
  const hueShift = HARMONY_HUE_SHIFT[harmony];
  const saturationDelta = HARMONY_ACCENT_SATURATION_DELTA[harmony];
  const lightnessDelta = HARMONY_ACCENT_LIGHTNESS_DELTA[harmony];

  return transformHexHsl(primary, (hsl) => ({
    h: hsl.h + hueShift,
    s: clamp(hsl.s + 8 + saturationDelta, 10, 96),
    l: clamp(hsl.l - 6 + lightnessDelta, 12, 88),
  }));
}

function deriveNeutral(primary: string): string {
  return transformHexHsl(primary, (hsl) => ({
    h: hsl.h,
    s: clamp(hsl.s * 0.16, 3, 20),
    l: clamp(hsl.l + 36, 14, 90),
  }));
}

function resolveMode(mode: "light" | "dark" | "system", options?: ResolveBrandThemeOptions): ResolvedBrandThemeMode {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return options?.systemModeFallback ?? "light";
}

export function normalizeBrandPaletteSeed(input: BrandPaletteSeedInput): BrandPaletteSeed | null {
  const primary = normalizeHexColor(input.primary);
  if (!primary) return null;

  const accent = normalizeHexColor(input.accent ?? "") ?? deriveAccent(primary, "analogous");
  const neutral = normalizeHexColor(input.neutral ?? "") ?? deriveNeutral(primary);

  return {
    source: input.source,
    primary,
    accent,
    neutral,
  };
}

function buildCoreTokensFromSeed(seed: BrandPaletteSeed, mode: ResolvedBrandThemeMode): BrandCorePaletteTokens {
  const neutralBase = seed.neutral;

  if (mode === "dark") {
    const background = mixHexColors(neutralBase, "#05070a", 0.76);
    const card = mixHexColors(background, "#111827", 0.42);
    const muted = mixHexColors(background, neutralBase, 0.3);
    const foreground = "#e6edf5";

    return {
      background,
      foreground,
      card,
      cardForeground: foreground,
      muted,
      mutedForeground: mixHexColors(foreground, "#94a3b8", 0.46),
      primary: mixHexColors(seed.primary, "#ffffff", 0.16),
      primaryForeground: "#0b1220",
      border: toRgba("#cbd5e1", 0.2),
      ring: toRgba(seed.accent, 0.36),
    };
  }

  const background = mixHexColors(neutralBase, "#ffffff", 0.88);
  const card = "#ffffff";
  const muted = mixHexColors(background, neutralBase, 0.35);
  const foreground = "#0f172a";

  return {
    background,
    foreground,
    card,
    cardForeground: foreground,
    muted,
    mutedForeground: mixHexColors(foreground, "#64748b", 0.52),
    primary: seed.primary,
    primaryForeground: getReadableForeground(seed.primary),
    border: toRgba("#0f172a", 0.14),
    ring: toRgba(seed.accent, 0.35),
  };
}

export function resolveBrandThemeTokensFromPaletteSeed(input: {
  seed: BrandPaletteSeedInput;
  mode: "light" | "dark" | "system";
  config?: BuildBrandThemeConfigOptions;
  options?: ResolveBrandThemeOptions;
}) {
  const normalizedSeed = normalizeBrandPaletteSeed(input.seed);
  if (!normalizedSeed) return null;

  const harmony = input.config?.harmony ?? DEFAULT_BRAND_THEME_CONFIG.harmony;
  const explicitAccent = normalizeHexColor(input.seed.accent ?? "");
  const accentBase = explicitAccent ?? deriveAccent(normalizedSeed.primary, harmony);
  const resolvedSeed: BrandPaletteSeed = {
    ...normalizedSeed,
    accent: accentBase,
  };

  const mode = resolveMode(input.mode, input.options);
  const oppositeMode = mode === "dark" ? "light" : "dark";

  const core = buildCoreTokensFromSeed(resolvedSeed, mode);
  const oppositeCore = buildCoreTokensFromSeed(resolvedSeed, oppositeMode);

  return buildBrandSemanticTokens({
    core,
    oppositeCore,
    mode,
    harmony,
    accentStyle: input.config?.accentStyle ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle,
    typographyPreset: input.config?.typographyPreset ?? DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
    accentBase,
  });
}
