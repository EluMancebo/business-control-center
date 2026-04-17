import type {
  BrandAccentStyle,
  BrandCorePaletteTokens,
  BrandHarmonyStrategy,
  BrandSemanticTokens,
  BrandTypographyPreset,
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

const ACCENT_SATURATION_DELTA: Record<BrandAccentStyle, number> = {
  minimal: -18,
  balanced: 0,
  expressive: 18,
};

const ACCENT_LIGHTNESS_DELTA: Record<BrandAccentStyle, number> = {
  minimal: -4,
  balanced: 0,
  expressive: 4,
};

const HARMONY_SATURATION_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: -18,
  analogous: -8,
  complementary: 10,
  "split-complementary": 8,
  triadic: 12,
  tetradic: 14,
};

const HARMONY_LIGHTNESS_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 14,
  analogous: 4,
  complementary: -8,
  "split-complementary": -6,
  triadic: -4,
  tetradic: -6,
};

const HARMONY_SOFT_MIX: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 0.82,
  analogous: 0.72,
  complementary: 0.44,
  "split-complementary": 0.5,
  triadic: 0.48,
  tetradic: 0.42,
};

const HARMONY_STRONG_SATURATION_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 2,
  analogous: 6,
  complementary: 14,
  "split-complementary": 12,
  triadic: 13,
  tetradic: 15,
};

const HARMONY_STRONG_LIGHTNESS_DELTA: Record<BrandHarmonyStrategy, number> = {
  monochromatic: 5,
  analogous: 7,
  complementary: 12,
  "split-complementary": 10,
  triadic: 11,
  tetradic: 14,
};

const ACCENT_STYLE_SOFT_MIX_DELTA: Record<BrandAccentStyle, number> = {
  minimal: 0.2,
  balanced: 0,
  expressive: -0.2,
};

const ACCENT_STYLE_STRONG_SATURATION_DELTA: Record<BrandAccentStyle, number> = {
  minimal: -8,
  balanced: 0,
  expressive: 10,
};

const ACCENT_STYLE_STRONG_LIGHTNESS_DELTA: Record<BrandAccentStyle, number> = {
  minimal: -4,
  balanced: 0,
  expressive: 5,
};

const ACCENT_STYLE_CONTRAST_DELTA: Record<BrandAccentStyle, number> = {
  minimal: -0.24,
  balanced: 0,
  expressive: 0.36,
};

const CONTRAST_ADJUST_MAX_STEPS = 20;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(input: string): string | null {
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
  const normalized = normalizeHex(input);
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

function srgbChannelToLinear(channel: number): number {
  const normalized = clamp(channel, 0, 255) / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(color: string): number | null {
  const rgb = hexToRgb(color);
  if (!rgb) return null;
  return (
    0.2126 * srgbChannelToLinear(rgb.r) +
    0.7152 * srgbChannelToLinear(rgb.g) +
    0.0722 * srgbChannelToLinear(rgb.b)
  );
}

function getContrastRatio(a: string, b: string): number {
  const luminanceA = getRelativeLuminance(a);
  const luminanceB = getRelativeLuminance(b);
  if (luminanceA === null || luminanceB === null) return 1;

  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
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

function nudgeForContrast(
  input: string,
  step: number,
  saturationStep: number
): string {
  return transformHexHsl(input, (hsl) => ({
    h: hsl.h,
    s: clamp(hsl.s + saturationStep, 0, 100),
    l: clamp(hsl.l + step, 4, 96),
  }));
}

function tryAdjustContrast(args: {
  color: string;
  background: string;
  minRatio: number;
  step: number;
  saturationStep: number;
}): { color: string; ratio: number } {
  let current = args.color;
  let best = current;
  let bestRatio = getContrastRatio(current, args.background);

  if (bestRatio >= args.minRatio) {
    return { color: current, ratio: bestRatio };
  }

  for (let index = 0; index < CONTRAST_ADJUST_MAX_STEPS; index += 1) {
    const next = nudgeForContrast(current, args.step, args.saturationStep);
    if (next === current) break;
    current = next;
    const ratio = getContrastRatio(current, args.background);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = current;
    }
    if (ratio >= args.minRatio) {
      return { color: current, ratio };
    }
  }

  return { color: best, ratio: bestRatio };
}

function ensureContrastAgainstBackground(args: {
  color: string;
  background: string;
  minRatio: number;
  prefer: "lighter" | "darker";
}): string {
  const initialRatio = getContrastRatio(args.color, args.background);
  if (initialRatio >= args.minRatio) return args.color;

  const preferredStep = args.prefer === "lighter" ? 3 : -3;
  const oppositeStep = preferredStep * -1;
  const preferredSaturationStep = args.prefer === "lighter" ? 0 : 1;
  const oppositeSaturationStep = args.prefer === "lighter" ? 1 : 0;

  const preferredResult = tryAdjustContrast({
    color: args.color,
    background: args.background,
    minRatio: args.minRatio,
    step: preferredStep,
    saturationStep: preferredSaturationStep,
  });

  if (preferredResult.ratio >= args.minRatio) return preferredResult.color;

  const oppositeResult = tryAdjustContrast({
    color: args.color,
    background: args.background,
    minRatio: args.minRatio,
    step: oppositeStep,
    saturationStep: oppositeSaturationStep,
  });

  return oppositeResult.ratio > preferredResult.ratio
    ? oppositeResult.color
    : preferredResult.color;
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

function deriveAccentBase(
  primary: string,
  harmony: BrandHarmonyStrategy,
  accentStyle: BrandAccentStyle,
  mode: ResolvedBrandThemeMode
): string {
  const hueShift = HARMONY_HUE_SHIFT[harmony];
  const saturationDelta = ACCENT_SATURATION_DELTA[accentStyle] + HARMONY_SATURATION_DELTA[harmony];
  const styleLightnessDelta = ACCENT_LIGHTNESS_DELTA[accentStyle] + HARMONY_LIGHTNESS_DELTA[harmony];
  const modeLightnessDelta = mode === "dark" ? 8 : -6;

  return transformHexHsl(primary, (hsl) => ({
    h: hsl.h + hueShift,
    s: clamp(hsl.s + saturationDelta, 8, 95),
    l: clamp(hsl.l + styleLightnessDelta + modeLightnessDelta, 16, 88),
  }));
}

function getContrastText(color: string, darkText: string, lightText: string): string {
  const darkRatio = getContrastRatio(color, darkText);
  const lightRatio = getContrastRatio(color, lightText);
  return darkRatio >= lightRatio ? darkText : lightText;
}

function deriveSurface(background: string, mode: ResolvedBrandThemeMode, step: 1 | 2): string {
  const lightnessDelta =
    mode === "dark"
      ? step === 1
        ? 7
        : 13
      : step === 1
        ? -5
        : -10;
  return transformHexHsl(background, (hsl) => ({
    h: hsl.h,
    s: clamp(hsl.s * (mode === "dark" ? 0.7 : 0.55), 0, mode === "dark" ? 16 : 10),
    l: clamp(hsl.l + lightnessDelta, 6, 96),
  }));
}

function deriveOperationalColor(args: {
  primary: string;
  background: string;
  mode: ResolvedBrandThemeMode;
  hue: number;
  saturation: number;
  lightnessLight: number;
  lightnessDark: number;
  minContrast: number;
}): string {
  const candidate = transformHexHsl(args.primary, () => ({
    h: args.hue,
    s: args.saturation,
    l: args.mode === "dark" ? args.lightnessDark : args.lightnessLight,
  }));

  return ensureContrastAgainstBackground({
    color: candidate,
    background: args.background,
    minRatio: args.minContrast,
    prefer: args.mode === "dark" ? "lighter" : "darker",
  });
}

function stabilizeBackgroundTone(
  background: string,
  primary: string,
  mode: ResolvedBrandThemeMode
): string {
  const neutralized = transformHexHsl(background, (hsl) => ({
    h: hsl.h,
    s:
      mode === "dark"
        ? clamp(hsl.s * 0.25, 0, 14)
        : clamp(hsl.s * 0.18, 0, 8),
    l:
      mode === "dark"
        ? clamp(hsl.l * 0.35 + 6.5, 4, 14)
        : clamp(hsl.l * 0.3 + 69, 94, 99),
  }));

  return mixHexColors(neutralized, primary, mode === "dark" ? 0.032 : 0.024);
}

export function buildBrandSemanticTokens(args: {
  core: BrandCorePaletteTokens;
  oppositeCore: BrandCorePaletteTokens;
  mode: ResolvedBrandThemeMode;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
  accentBase?: string;
}): BrandSemanticTokens {
  const { core, oppositeCore, mode, harmony, accentStyle, typographyPreset, accentBase } = args;

  const background = stabilizeBackgroundTone(core.background, core.primary, mode);
  const foreground = ensureContrastAgainstBackground({
    color: core.foreground,
    background,
    minRatio: mode === "dark" ? 9.5 : 9,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const primary = ensureContrastAgainstBackground({
    color: core.primary,
    background,
    minRatio: mode === "dark" ? 3.4 : 3.2,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const primaryForeground = getContrastText(primary, "#0a0a0a", "#ffffff");

  const cardBase = deriveSurface(background, mode, 1);
  const mutedBase = deriveSurface(background, mode, 2);
  const primaryTintForSurfaces = mixHexColors(
    primary,
    background,
    mode === "dark" ? 0.8 : 0.86
  );
  const card = mixHexColors(cardBase, primaryTintForSurfaces, mode === "dark" ? 0.04 : 0.03);
  const muted = mixHexColors(mutedBase, primaryTintForSurfaces, mode === "dark" ? 0.05 : 0.04);
  const cardForeground = ensureContrastAgainstBackground({
    color: core.cardForeground,
    background: card,
    minRatio: mode === "dark" ? 7.2 : 7,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const mutedForeground = ensureContrastAgainstBackground({
    color: core.mutedForeground,
    background: muted,
    minRatio: mode === "dark" ? 5.2 : 4.9,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const borderBase = mixHexColors(
    mode === "dark" ? muted : card,
    background,
    mode === "dark" ? 0.58 : 0.68
  );
  const border = ensureContrastAgainstBackground({
    color: borderBase,
    background,
    minRatio: 1.16,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const ring = ensureContrastAgainstBackground({
    color: core.ring,
    background,
    minRatio: mode === "dark" ? 2.8 : 2.6,
    prefer: mode === "dark" ? "lighter" : "darker",
  });

  const accentSeed = accentBase ?? deriveAccentBase(primary, harmony, accentStyle, mode);
  const accentContrastTarget =
    (mode === "dark" ? 3 : 2.7) + ACCENT_STYLE_CONTRAST_DELTA[accentStyle];
  const accent = ensureContrastAgainstBackground({
    color: accentSeed,
    background,
    minRatio: accentContrastTarget,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const strongSaturationDelta =
    HARMONY_STRONG_SATURATION_DELTA[harmony] +
    ACCENT_STYLE_STRONG_SATURATION_DELTA[accentStyle];
  const strongLightnessDelta =
    HARMONY_STRONG_LIGHTNESS_DELTA[harmony] +
    ACCENT_STYLE_STRONG_LIGHTNESS_DELTA[accentStyle];
  const softMixBase =
    HARMONY_SOFT_MIX[harmony] + ACCENT_STYLE_SOFT_MIX_DELTA[accentStyle];
  const softMixRatio =
    mode === "dark"
      ? clamp(softMixBase + 0.08, 0.42, 0.95)
      : clamp(softMixBase, 0.42, 0.95);
  const accentStrongRaw =
    mode === "dark"
      ? transformHexHsl(accent, (hsl) => ({
          h: hsl.h,
          s: clamp(hsl.s + strongSaturationDelta, 0, 100),
          l: clamp(hsl.l + strongLightnessDelta, 0, 100),
        }))
      : transformHexHsl(accent, (hsl) => ({
          h: hsl.h,
          s: clamp(hsl.s + strongSaturationDelta, 0, 100),
          l: clamp(hsl.l - strongLightnessDelta, 0, 100),
        }));
  const accentStrong = ensureContrastAgainstBackground({
    color: accentStrongRaw,
    background,
    minRatio:
      (mode === "dark" ? 3.6 : 3.2) +
      ACCENT_STYLE_CONTRAST_DELTA[accentStyle] * 0.5,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const accentSoftRaw = mixHexColors(accent, background, softMixRatio);
  const accentSoft = ensureContrastAgainstBackground({
    color: accentSoftRaw,
    background,
    minRatio: mode === "dark" ? 1.35 : 1.22,
    prefer: mode === "dark" ? "lighter" : "darker",
  });

  const accentForeground = getContrastText(accent, "#0a0a0a", "#ffffff");
  const accentStrongForeground = getContrastText(accentStrong, "#0a0a0a", "#ffffff");
  const accentSoftForeground = getContrastText(accentSoft, "#0a0a0a", "#ffffff");

  const surface2Base = deriveSurface(background, mode, 1);
  const surface3Base = deriveSurface(background, mode, 2);
  const harmonySurfaceTint: Record<BrandHarmonyStrategy, number> = {
    monochromatic: 0.01,
    analogous: 0.018,
    complementary: 0.026,
    "split-complementary": 0.024,
    triadic: 0.028,
    tetradic: 0.03,
  };
  const styleSurfaceTint: Record<BrandAccentStyle, number> = {
    minimal: -0.004,
    balanced: 0,
    expressive: 0.01,
  };
  const surface2TintRatio = clamp(
    (mode === "dark" ? 0.018 : 0.014) +
      harmonySurfaceTint[harmony] +
      styleSurfaceTint[accentStyle],
    0.008,
    0.06
  );
  const surface3TintRatio = clamp(
    surface2TintRatio + (mode === "dark" ? 0.012 : 0.01),
    0.015,
    0.08
  );
  const surface2 = mixHexColors(surface2Base, primaryTintForSurfaces, surface2TintRatio);
  const surface3 = mixHexColors(surface3Base, primaryTintForSurfaces, surface3TintRatio);

  const secondary = muted;
  const secondaryForeground = mutedForeground;

  const ctaPrimary = accentStrong;
  const ctaPrimaryForeground = getContrastText(ctaPrimary, "#0a0a0a", "#ffffff");
  const ctaPrimaryHover =
    mode === "dark"
      ? transformHexHsl(ctaPrimary, (hsl) => ({ h: hsl.h, s: clamp(hsl.s + 4, 0, 100), l: clamp(hsl.l + 9, 0, 100) }))
      : transformHexHsl(ctaPrimary, (hsl) => ({ h: hsl.h, s: clamp(hsl.s + 2, 0, 100), l: clamp(hsl.l - 10, 0, 100) }));

  const ctaSecondary = mixHexColors(
    secondary,
    accentSoft,
    mode === "dark" ? 0.24 : 0.18
  );
  const ctaSecondaryForeground = getContrastText(ctaSecondary, "#0a0a0a", "#ffffff");
  const ctaSecondaryHover =
    mode === "dark"
      ? transformHexHsl(ctaSecondary, (hsl) => ({ h: hsl.h, s: clamp(hsl.s + 3, 0, 100), l: clamp(hsl.l + 8, 0, 100) }))
      : transformHexHsl(ctaSecondary, (hsl) => ({ h: hsl.h, s: clamp(hsl.s + 2, 0, 100), l: clamp(hsl.l - 8, 0, 100) }));

  const link = ensureContrastAgainstBackground({
    color: mode === "dark" ? accentStrong : transformHexHsl(accentStrong, (hsl) => ({
      h: hsl.h,
      s: clamp(hsl.s + 2, 0, 100),
      l: clamp(hsl.l - 4, 0, 100),
    })),
    background,
    minRatio: mode === "dark" ? 4.4 : 4.2,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const linkHoverSeed =
    mode === "dark"
      ? transformHexHsl(link, (hsl) => ({
          h: hsl.h,
          s: clamp(hsl.s + 7, 0, 100),
          l: clamp(hsl.l + 13, 0, 100),
        }))
      : transformHexHsl(link, (hsl) => ({
          h: hsl.h,
          s: clamp(hsl.s + 5, 0, 100),
          l: clamp(hsl.l - 13, 0, 100),
        }));
  const linkHover = ensureContrastAgainstBackground({
    color: linkHoverSeed,
    background,
    minRatio: mode === "dark" ? 4.4 : 4.2,
    prefer: mode === "dark" ? "lighter" : "darker",
  });

  const success = deriveOperationalColor({
    primary,
    background,
    mode,
    hue: 142,
    saturation: 62,
    lightnessLight: 36,
    lightnessDark: 68,
    minContrast: mode === "dark" ? 4.1 : 4.2,
  });
  const successSoft = ensureContrastAgainstBackground({
    color: mixHexColors(success, background, mode === "dark" ? 0.62 : 0.76),
    background,
    minRatio: mode === "dark" ? 1.24 : 1.18,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const successForeground = getContrastText(successSoft, "#052e16", "#ecfdf5");

  const warning = deriveOperationalColor({
    primary,
    background,
    mode,
    hue: 38,
    saturation: 78,
    lightnessLight: 42,
    lightnessDark: 72,
    minContrast: mode === "dark" ? 3.6 : 3.8,
  });
  const warningSoft = ensureContrastAgainstBackground({
    color: mixHexColors(warning, background, mode === "dark" ? 0.6 : 0.74),
    background,
    minRatio: mode === "dark" ? 1.24 : 1.18,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const warningForeground = getContrastText(warningSoft, "#422006", "#fffbeb");

  const danger = deriveOperationalColor({
    primary,
    background,
    mode,
    hue: 8,
    saturation: 72,
    lightnessLight: 42,
    lightnessDark: 66,
    minContrast: mode === "dark" ? 4.1 : 4.2,
  });
  const dangerSoft = ensureContrastAgainstBackground({
    color: mixHexColors(danger, background, mode === "dark" ? 0.6 : 0.76),
    background,
    minRatio: mode === "dark" ? 1.24 : 1.18,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const dangerForeground = getContrastText(dangerSoft, "#450a0a", "#fef2f2");

  const processing = deriveOperationalColor({
    primary,
    background,
    mode,
    hue: 214,
    saturation: 70,
    lightnessLight: 40,
    lightnessDark: 68,
    minContrast: mode === "dark" ? 4.1 : 4.2,
  });
  const processingSoft = ensureContrastAgainstBackground({
    color: mixHexColors(processing, background, mode === "dark" ? 0.64 : 0.78),
    background,
    minRatio: mode === "dark" ? 1.24 : 1.18,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const processingForeground = getContrastText(processingSoft, "#082f49", "#eff6ff");

  const taskSurfaceRaw = mixHexColors(surface3, accentSoft, mode === "dark" ? 0.22 : 0.14);
  const taskSurface = ensureContrastAgainstBackground({
    color: taskSurfaceRaw,
    background,
    minRatio: mode === "dark" ? 1.3 : 1.2,
    prefer: mode === "dark" ? "lighter" : "darker",
  });
  const taskSurfaceForeground = ensureContrastAgainstBackground({
    color: foreground,
    background: taskSurface,
    minRatio: mode === "dark" ? 7 : 6.8,
    prefer: mode === "dark" ? "lighter" : "darker",
  });

  return {
    background,
    foreground,
    card,
    cardForeground,
    muted,
    mutedForeground,
    primary,
    primaryForeground,
    border,
    ring,

    secondary,
    secondaryForeground,

    accent,
    accentForeground,
    accentSoft,
    accentSoftForeground,
    accentStrong,
    accentStrongForeground,

    surface2,
    surface3,

    textSubtle: mutedForeground,
    textInverse: oppositeCore.foreground,

    ctaPrimary,
    ctaPrimaryForeground,
    ctaPrimaryHover,

    ctaSecondary,
    ctaSecondaryForeground,
    ctaSecondaryHover,

    badgeBg: accentSoft,
    badgeFg: accentSoftForeground,

    success,
    successForeground,
    successSoft,

    warning,
    warningForeground,
    warningSoft,

    danger,
    dangerForeground,
    dangerSoft,

    processing,
    processingForeground,
    processingSoft,

    taskSurface,
    taskSurfaceForeground,

    heroOverlay: mode === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.34)",
    heroOverlayStrong: mode === "dark" ? "rgba(0, 0, 0, 0.72)" : "rgba(0, 0, 0, 0.58)",

    link,
    linkHover,

    typographyPreset,
  };
}

export function toBrandCssVariables(tokens: BrandSemanticTokens): Record<string, string> {
  return {
    "--background": tokens.background,
    "--foreground": tokens.foreground,
    "--card": tokens.card,
    "--card-foreground": tokens.cardForeground,
    "--muted": tokens.muted,
    "--muted-foreground": tokens.mutedForeground,
    "--primary": tokens.primary,
    "--primary-foreground": tokens.primaryForeground,
    "--border": tokens.border,
    "--ring": tokens.ring,

    "--secondary": tokens.secondary,
    "--secondary-foreground": tokens.secondaryForeground,

    "--accent": tokens.accent,
    "--accent-foreground": tokens.accentForeground,
    "--accent-soft": tokens.accentSoft,
    "--accent-soft-foreground": tokens.accentSoftForeground,
    "--accent-strong": tokens.accentStrong,
    "--accent-strong-foreground": tokens.accentStrongForeground,

    "--surface-2": tokens.surface2,
    "--surface-3": tokens.surface3,
    "--surface-1": tokens.background,

    // Panel shells and Studio surfaces consume these directly.
    "--panel-background": tokens.background,
    "--panel-surface-1": tokens.background,
    "--panel-surface-2": tokens.surface2,
    "--panel-surface-3": tokens.surface3,
    "--panel-card": tokens.card,
    "--panel-border": tokens.border,
    "--panel-topbar": tokens.surface3,
    "--panel-sidebar": tokens.surface2,

    "--text-subtle": tokens.textSubtle,
    "--text-inverse": tokens.textInverse,

    "--cta-primary": tokens.ctaPrimary,
    "--cta-primary-foreground": tokens.ctaPrimaryForeground,
    "--cta-primary-hover": tokens.ctaPrimaryHover,

    "--cta-secondary": tokens.ctaSecondary,
    "--cta-secondary-foreground": tokens.ctaSecondaryForeground,
    "--cta-secondary-hover": tokens.ctaSecondaryHover,

    "--badge-bg": tokens.badgeBg,
    "--badge-fg": tokens.badgeFg,

    "--success": tokens.success,
    "--success-foreground": tokens.successForeground,
    "--success-soft": tokens.successSoft,

    "--warning": tokens.warning,
    "--warning-foreground": tokens.warningForeground,
    "--warning-soft": tokens.warningSoft,

    "--danger": tokens.danger,
    "--danger-foreground": tokens.dangerForeground,
    "--danger-soft": tokens.dangerSoft,

    "--processing": tokens.processing,
    "--processing-foreground": tokens.processingForeground,
    "--processing-soft": tokens.processingSoft,

    "--task-surface": tokens.taskSurface,
    "--task-surface-foreground": tokens.taskSurfaceForeground,

    "--hero-overlay": tokens.heroOverlay,
    "--hero-overlay-strong": tokens.heroOverlayStrong,

    "--link": tokens.link,
    "--link-hover": tokens.linkHover,
  };
}
