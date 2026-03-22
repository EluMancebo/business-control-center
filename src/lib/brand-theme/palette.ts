import { DEFAULT_BRAND_THEME_CONFIG } from "./resolver";
import { buildBrandSemanticTokens } from "./tokens";
import type {
  BrandAccentStyle,
  BrandCorePaletteTokens,
  BrandHarmonyStrategy,
  BrandPaletteSeed,
  BrandPaletteSeedInput,
  BrandSemanticTokens,
  BuildBrandThemeConfigOptions,
  ResolveBrandThemeOptions,
  ResolvedBrandThemeMode,
} from "./types";

type RGB = { r: number; g: number; b: number };

const HARMONY_HUE_SHIFT: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 0,
  analogous: 26,
  complementary: 172,
  "split-complementary": 148,
  triadic: 118,
  tetradic: 88,
};

const HARMONY_ACCENT_SATURATION_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: -16,
  analogous: -8,
  complementary: 10,
  "split-complementary": 8,
  triadic: 12,
  tetradic: 14,
};

const HARMONY_ACCENT_LIGHTNESS_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 14,
  analogous: 4,
  complementary: -8,
  "split-complementary": -6,
  triadic: -4,
  tetradic: -6,
};

const HARMONY_EXPLICIT_ACCENT_BLEND: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 0.06,
  analogous: 0.1,
  complementary: 0.16,
  "split-complementary": 0.14,
  triadic: 0.13,
  tetradic: 0.17,
};

const HARMONY_MIN_HUE_DISTANCE: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 0,
  analogous: 18,
  complementary: 56,
  "split-complementary": 44,
  triadic: 38,
  tetradic: 28,
};

const HARMONY_MIN_LIGHTNESS_DISTANCE: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 18,
  analogous: 12,
  complementary: 10,
  "split-complementary": 10,
  triadic: 9,
  tetradic: 10,
};

const ACCENT_STYLE_SATURATION_DELTA: Record<BrandAccentStyle, number> = {
  minimal: -16,
  balanced: 0,
  expressive: 18,
};

const ACCENT_STYLE_LIGHTNESS_DELTA: Record<BrandAccentStyle, number> = {
  minimal: 6,
  balanced: 0,
  expressive: -4,
};

const ACCENT_STYLE_HUE_DISTANCE_BOOST: Record<BrandAccentStyle, number> = {
  minimal: -6,
  balanced: 0,
  expressive: 10,
};

const ACCENT_STYLE_PRIMARY_BLEND: Record<BrandAccentStyle, number> = {
  minimal: 0.16,
  balanced: 0.06,
  expressive: 0,
};

const ACCENT_STYLE_LIGHTNESS_DISTANCE_BOOST: Record<BrandAccentStyle, number> = {
  minimal: 6,
  balanced: 0,
  expressive: -2,
};

const ACHROMATIC_PRIMARY_HUE_ANCHOR = 220;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHue(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signedHueDelta(from: number, to: number): number {
  const delta = ((to - from + 540) % 360) - 180;
  return delta === -180 ? 180 : delta;
}

function hueDistance(a: number, b: number): number {
  return Math.abs(signedHueDelta(a, b));
}

function enforceHueDistance(primaryHue: number, candidateHue: number, minDistance: number): number {
  const distance = hueDistance(primaryHue, candidateHue);
  if (distance >= minDistance) return normalizeHue(candidateHue);
  const direction = signedHueDelta(primaryHue, candidateHue) >= 0 ? 1 : -1;
  return normalizeHue(primaryHue + direction * minDistance);
}

function enforceLightnessDistance(
  primaryLightness: number,
  candidateLightness: number,
  minDistance: number,
  preferredDirection: "lighter" | "darker"
): number {
  if (Math.abs(candidateLightness - primaryLightness) >= minDistance) {
    return clamp(candidateLightness, 8, 92);
  }

  const desired =
    preferredDirection === "lighter"
      ? primaryLightness + minDistance
      : primaryLightness - minDistance;
  const clampedDesired = clamp(desired, 8, 92);

  if (Math.abs(clampedDesired - primaryLightness) >= minDistance) {
    return clampedDesired;
  }

  const opposite =
    preferredDirection === "lighter"
      ? primaryLightness - minDistance
      : primaryLightness + minDistance;
  return clamp(opposite, 8, 92);
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

function stabilizeDarkModePrimary(primary: string): string {
  return transformHexHsl(primary, (hsl) => ({
    h: hsl.h,
    s: clamp(hsl.s + 4, 10, 96),
    l: clamp(hsl.l < 34 ? 34 : hsl.l, 20, 88),
  }));
}

function deriveAccent(
  primary: string,
  harmony: BrandHarmonyStrategy,
  accentStyle: BrandAccentStyle = "balanced"
): string {
  const primaryRgb = hexToRgb(primary);
  if (!primaryRgb) return primary;

  const primaryHsl = rgbToHsl(primaryRgb);
  const hueShift = HARMONY_HUE_SHIFT[harmony];
  const saturationDelta =
    HARMONY_ACCENT_SATURATION_DELTA[harmony] + ACCENT_STYLE_SATURATION_DELTA[accentStyle];
  const lightnessDelta =
    HARMONY_ACCENT_LIGHTNESS_DELTA[harmony] + ACCENT_STYLE_LIGHTNESS_DELTA[accentStyle];
  const minHueDistance = clamp(
    HARMONY_MIN_HUE_DISTANCE[harmony] + ACCENT_STYLE_HUE_DISTANCE_BOOST[accentStyle],
    0,
    170
  );
  const minLightnessDistance = clamp(
    HARMONY_MIN_LIGHTNESS_DISTANCE[harmony] +
      ACCENT_STYLE_LIGHTNESS_DISTANCE_BOOST[accentStyle],
    8,
    32
  );

  const basePrimaryHue =
    primaryHsl.s < 6 ? ACHROMATIC_PRIMARY_HUE_ANCHOR : primaryHsl.h;
  const baseHue = normalizeHue(basePrimaryHue + hueShift);
  const hue =
    harmony === "monochromatic"
      ? baseHue
      : enforceHueDistance(basePrimaryHue, baseHue, minHueDistance);
  const nonMonoFloor =
    harmony === "monochromatic"
      ? 10
      : 20 + (accentStyle === "expressive" ? 8 : accentStyle === "minimal" ? -4 : 0);
  const saturation = clamp(
    Math.max(primaryHsl.s + 10 + saturationDelta, nonMonoFloor),
    10,
    98
  );
  const preferredDirection = primaryHsl.l >= 52 ? "darker" : "lighter";
  const extremeLightnessBoost = primaryHsl.l <= 20 || primaryHsl.l >= 82 ? 4 : 0;
  const lightness = enforceLightnessDistance(
    primaryHsl.l,
    clamp(primaryHsl.l - 4 + lightnessDelta, 10, 90),
    clamp(minLightnessDistance + extremeLightnessBoost, 8, 34),
    preferredDirection
  );

  const derived = rgbToHex(hslToRgb(hue, saturation, lightness));
  const styleBlend = ACCENT_STYLE_PRIMARY_BLEND[accentStyle];
  if (styleBlend <= 0) return derived;
  return mixHexColors(derived, primary, styleBlend);
}

function deriveNeutral(primary: string): string {
  const primaryRgb = hexToRgb(primary);
  if (!primaryRgb) return "#94a3b8";

  const hsl = rgbToHsl(primaryRgb);
  const anchorHue = hsl.h >= 140 && hsl.h <= 310 ? 218 : 36;
  const hueDrift = clamp(0.06 + (hsl.s / 100) * 0.1, 0.06, 0.16);
  const hue = normalizeHue(hsl.h + signedHueDelta(hsl.h, anchorHue) * hueDrift);
  const saturation = clamp(3 + hsl.s * 0.08, 3, 12);
  const lightnessLift = hsl.l >= 78 ? 14 : hsl.l <= 22 ? 38 : 30;
  const lightness = clamp(hsl.l + lightnessLift - hsl.s * 0.04, 24, 84);

  return rgbToHex(hslToRgb(hue, saturation, lightness));
}

function resolveMode(mode: "light" | "dark" | "system", options?: ResolveBrandThemeOptions): ResolvedBrandThemeMode {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return options?.systemModeFallback ?? "light";
}

export function normalizeBrandPaletteSeed(input: BrandPaletteSeedInput): BrandPaletteSeed | null {
  const primary = normalizeHexColor(input.primary);
  if (!primary) return null;

  const accent =
    normalizeHexColor(input.accent ?? "") ?? deriveAccent(primary, "analogous", "balanced");
  const neutral = normalizeHexColor(input.neutral ?? "") ?? deriveNeutral(primary);

  return {
    source: input.source,
    primary,
    accent,
    neutral,
  };
}

export type BrandPaletteSeedResolution = {
  normalizedSeed: BrandPaletteSeed;
  resolvedSeed: BrandPaletteSeed;
  explicitAccent: string | null;
  derivedAccent: string;
  accentSource: "explicit-blend" | "derived";
};

export function resolveBrandPaletteSeedWithHarmony(input: {
  seed: BrandPaletteSeedInput;
  harmony: BrandHarmonyStrategy;
  accentStyle?: BrandAccentStyle;
}): BrandPaletteSeedResolution | null {
  const normalizedSeed = normalizeBrandPaletteSeed(input.seed);
  if (!normalizedSeed) return null;

  const accentStyle = input.accentStyle ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle;
  const explicitAccent = normalizeHexColor(input.seed.accent ?? "");
  const derivedAccent = explicitAccent
    ? deriveAccent(normalizedSeed.primary, input.harmony, "balanced")
    : deriveAccent(normalizedSeed.primary, input.harmony, accentStyle);
  const resolvedAccent = explicitAccent
    ? mixHexColors(
        explicitAccent,
        derivedAccent,
        HARMONY_EXPLICIT_ACCENT_BLEND[input.harmony]
      )
    : derivedAccent;

  return {
    normalizedSeed,
    resolvedSeed: {
      ...normalizedSeed,
      accent: resolvedAccent,
    },
    explicitAccent,
    derivedAccent,
    accentSource: explicitAccent ? "explicit-blend" : "derived",
  };
}

function buildCoreTokensFromSeed(seed: BrandPaletteSeed, mode: ResolvedBrandThemeMode): BrandCorePaletteTokens {
  const neutralBase = seed.neutral;

  if (mode === "dark") {
    const background = mixHexColors(neutralBase, "#05070a", 0.76);
    const card = mixHexColors(background, "#111827", 0.42);
    const muted = mixHexColors(background, neutralBase, 0.3);
    const foreground = "#e6edf5";
    const primary = stabilizeDarkModePrimary(mixHexColors(seed.primary, "#ffffff", 0.16));

    return {
      background,
      foreground,
      card,
      cardForeground: foreground,
      muted,
      mutedForeground: mixHexColors(foreground, "#94a3b8", 0.46),
      primary,
      primaryForeground: getReadableForeground(primary, "#0b1220", "#f8fafc"),
      border: toRgba("#cbd5e1", 0.2),
      ring: toRgba(seed.accent, 0.36),
    };
  }

  const background = mixHexColors(neutralBase, "#ffffff", 0.93);
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
}): BrandSemanticTokens | null {
  return resolveBrandThemeTokensFromPaletteSeedWithMeta(input)?.tokens ?? null;
}

export type ResolveBrandThemeTokensFromPaletteSeedWithMetaResult = {
  tokens: BrandSemanticTokens;
  normalizedSeed: BrandPaletteSeed;
  resolvedSeed: BrandPaletteSeed;
  accentSource: BrandPaletteSeedResolution["accentSource"];
  explicitAccent: string | null;
};

export function resolveBrandThemeTokensFromPaletteSeedWithMeta(input: {
  seed: BrandPaletteSeedInput;
  mode: "light" | "dark" | "system";
  config?: BuildBrandThemeConfigOptions;
  options?: ResolveBrandThemeOptions;
}): ResolveBrandThemeTokensFromPaletteSeedWithMetaResult | null {
  const harmony = input.config?.harmony ?? DEFAULT_BRAND_THEME_CONFIG.harmony;
  const seedResolution = resolveBrandPaletteSeedWithHarmony({
    seed: input.seed,
    harmony,
    accentStyle: input.config?.accentStyle ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle,
  });
  if (!seedResolution) return null;

  const mode = resolveMode(input.mode, input.options);
  const oppositeMode = mode === "dark" ? "light" : "dark";

  const core = buildCoreTokensFromSeed(seedResolution.resolvedSeed, mode);
  const oppositeCore = buildCoreTokensFromSeed(seedResolution.resolvedSeed, oppositeMode);
  const accentBase = seedResolution.resolvedSeed.accent;

  const tokens = buildBrandSemanticTokens({
    core,
    oppositeCore,
    mode,
    harmony,
    accentStyle: input.config?.accentStyle ?? DEFAULT_BRAND_THEME_CONFIG.accentStyle,
    typographyPreset: input.config?.typographyPreset ?? DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
    accentBase,
  });

  return {
    tokens,
    normalizedSeed: seedResolution.normalizedSeed,
    resolvedSeed: seedResolution.resolvedSeed,
    accentSource: seedResolution.accentSource,
    explicitAccent: seedResolution.explicitAccent,
  };
}
