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
  analogous: 30,
  complementary: 180,
  "split-complementary": 150,
  triadic: 120,
  tetradic: 90,
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
  const saturationDelta = ACCENT_SATURATION_DELTA[accentStyle];
  const styleLightnessDelta = ACCENT_LIGHTNESS_DELTA[accentStyle];
  const modeLightnessDelta = mode === "dark" ? 8 : -6;

  return transformHexHsl(primary, (hsl) => ({
    h: hsl.h + hueShift,
    s: clamp(hsl.s + saturationDelta, 8, 95),
    l: clamp(hsl.l + styleLightnessDelta + modeLightnessDelta, 16, 88),
  }));
}

function getContrastText(color: string, darkText: string, lightText: string): string {
  const rgb = hexToRgb(color);
  if (!rgb) return lightText;

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.58 ? darkText : lightText;
}

function deriveSurface(background: string, mode: ResolvedBrandThemeMode, step: 1 | 2): string {
  const lightnessDelta = mode === "dark" ? step * 5 : -step * 4;
  return transformHexHsl(background, (hsl) => ({
    h: hsl.h,
    s: hsl.s,
    l: clamp(hsl.l + lightnessDelta, 6, 96),
  }));
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

  const accent = accentBase ?? deriveAccentBase(core.primary, harmony, accentStyle, mode);
  const accentStrong =
    mode === "dark"
      ? transformHexHsl(accent, (hsl) => ({ h: hsl.h, s: clamp(hsl.s + 8, 0, 100), l: clamp(hsl.l + 10, 0, 100) }))
      : transformHexHsl(accent, (hsl) => ({ h: hsl.h, s: clamp(hsl.s + 6, 0, 100), l: clamp(hsl.l - 10, 0, 100) }));
  const accentSoft = mixHexColors(accent, core.background, mode === "dark" ? 0.7 : 0.82);

  const accentForeground = getContrastText(accent, "#0a0a0a", "#ffffff");
  const accentStrongForeground = getContrastText(accentStrong, "#0a0a0a", "#ffffff");
  const accentSoftForeground = getContrastText(accentSoft, "#0a0a0a", "#ffffff");

  const secondary = core.muted;
  const secondaryForeground = core.mutedForeground;

  const ctaPrimary = core.primary;
  const ctaPrimaryForeground = core.primaryForeground;
  const ctaPrimaryHover =
    mode === "dark"
      ? transformHexHsl(ctaPrimary, (hsl) => ({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + 8, 0, 100) }))
      : transformHexHsl(ctaPrimary, (hsl) => ({ h: hsl.h, s: hsl.s, l: clamp(hsl.l - 8, 0, 100) }));

  const ctaSecondary = secondary;
  const ctaSecondaryForeground = secondaryForeground;
  const ctaSecondaryHover =
    mode === "dark"
      ? transformHexHsl(ctaSecondary, (hsl) => ({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + 6, 0, 100) }))
      : transformHexHsl(ctaSecondary, (hsl) => ({ h: hsl.h, s: hsl.s, l: clamp(hsl.l - 6, 0, 100) }));

  return {
    background: core.background,
    foreground: core.foreground,
    card: core.card,
    cardForeground: core.cardForeground,
    muted: core.muted,
    mutedForeground: core.mutedForeground,
    primary: core.primary,
    primaryForeground: core.primaryForeground,
    border: core.border,
    ring: core.ring,

    secondary,
    secondaryForeground,

    accent,
    accentForeground,
    accentSoft,
    accentSoftForeground,
    accentStrong,
    accentStrongForeground,

    surface2: deriveSurface(core.background, mode, 1),
    surface3: deriveSurface(core.background, mode, 2),

    textSubtle: core.mutedForeground,
    textInverse: oppositeCore.foreground,

    ctaPrimary,
    ctaPrimaryForeground,
    ctaPrimaryHover,

    ctaSecondary,
    ctaSecondaryForeground,
    ctaSecondaryHover,

    badgeBg: accentSoft,
    badgeFg: accentSoftForeground,

    heroOverlay: mode === "dark" ? "rgba(0, 0, 0, 0.42)" : "rgba(0, 0, 0, 0.28)",
    heroOverlayStrong: mode === "dark" ? "rgba(0, 0, 0, 0.64)" : "rgba(0, 0, 0, 0.5)",

    link: accent,
    linkHover: accentStrong,

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

    "--hero-overlay": tokens.heroOverlay,
    "--hero-overlay-strong": tokens.heroOverlayStrong,

    "--link": tokens.link,
    "--link-hover": tokens.linkHover,
  };
}
