import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandThemePaletteId,
  BrandThemePalettePreset,
  BrandTypographyPreset,
} from "./types";

export const BRAND_THEME_HARMONY_OPTIONS: BrandHarmonyStrategy[] = [
  "monochromatic",
  "analogous",
  "complementary",
  "split-complementary",
  "triadic",
  "tetradic",
];

export const BRAND_THEME_ACCENT_STYLE_OPTIONS: BrandAccentStyle[] = [
  "minimal",
  "balanced",
  "expressive",
];

export const BRAND_THEME_TYPOGRAPHY_OPTIONS: BrandTypographyPreset[] = [
  "editorial",
  "modern",
  "classic",
  "geometric",
];

export const BRAND_THEME_PALETTES: Record<BrandThemePaletteId, BrandThemePalettePreset> = {
  bcc: {
    id: "bcc",
    label: "BCC (Default)",
    light: {
      background: "#ffffff",
      foreground: "#171717",
      card: "#ffffff",
      cardForeground: "#171717",
      muted: "#f1f5f9",
      mutedForeground: "#475569",
      primary: "#0f172a",
      primaryForeground: "#ffffff",
      border: "rgba(15, 23, 42, 0.14)",
      ring: "rgba(15, 23, 42, 0.35)",
    },
    dark: {
      background: "#0a0a0a",
      foreground: "#ededed",
      card: "#0f0f10",
      cardForeground: "#ededed",
      muted: "#111827",
      mutedForeground: "#cbd5e1",
      primary: "#e5e7eb",
      primaryForeground: "#0a0a0a",
      border: "rgba(237, 237, 237, 0.16)",
      ring: "rgba(237, 237, 237, 0.28)",
    },
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    light: {
      background: "#f8fafc",
      foreground: "#0f172a",
      card: "#ffffff",
      cardForeground: "#0f172a",
      muted: "#e2e8f0",
      mutedForeground: "#334155",
      primary: "#0369a1",
      primaryForeground: "#ffffff",
      border: "rgba(2, 132, 199, 0.18)",
      ring: "rgba(2, 132, 199, 0.35)",
    },
    dark: {
      background: "#071018",
      foreground: "#e2e8f0",
      card: "#0b1621",
      cardForeground: "#e2e8f0",
      muted: "#0f1d2b",
      mutedForeground: "#cbd5e1",
      primary: "#38bdf8",
      primaryForeground: "#071018",
      border: "rgba(56, 189, 248, 0.2)",
      ring: "rgba(56, 189, 248, 0.28)",
    },
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    light: {
      background: "#fff7ed",
      foreground: "#1f2937",
      card: "#ffffff",
      cardForeground: "#1f2937",
      muted: "#ffedd5",
      mutedForeground: "#7c2d12",
      primary: "#ea580c",
      primaryForeground: "#ffffff",
      border: "rgba(234, 88, 12, 0.2)",
      ring: "rgba(234, 88, 12, 0.35)",
    },
    dark: {
      background: "#140a06",
      foreground: "#ffedd5",
      card: "#1b0d07",
      cardForeground: "#ffedd5",
      muted: "#2a120b",
      mutedForeground: "#fed7aa",
      primary: "#fb923c",
      primaryForeground: "#140a06",
      border: "rgba(251, 146, 60, 0.2)",
      ring: "rgba(251, 146, 60, 0.28)",
    },
  },
  mono: {
    id: "mono",
    label: "Mono",
    light: {
      background: "#ffffff",
      foreground: "#111827",
      card: "#ffffff",
      cardForeground: "#111827",
      muted: "#f3f4f6",
      mutedForeground: "#374151",
      primary: "#111827",
      primaryForeground: "#ffffff",
      border: "rgba(17, 24, 39, 0.14)",
      ring: "rgba(17, 24, 39, 0.3)",
    },
    dark: {
      background: "#0b0b0c",
      foreground: "#f3f4f6",
      card: "#101012",
      cardForeground: "#f3f4f6",
      muted: "#16161a",
      mutedForeground: "#d1d5db",
      primary: "#f3f4f6",
      primaryForeground: "#0b0b0c",
      border: "rgba(243, 244, 246, 0.14)",
      ring: "rgba(243, 244, 246, 0.24)",
    },
  },
};

export function getBrandThemePalettePreset(
  paletteId: BrandThemePaletteId
): BrandThemePalettePreset {
  return BRAND_THEME_PALETTES[paletteId] ?? BRAND_THEME_PALETTES.bcc;
}
