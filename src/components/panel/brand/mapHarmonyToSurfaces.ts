import type { BrandAccentStyle, BrandHarmonyStrategy } from "@/lib/brand-theme";

export type HarmonySurfacePalette = {
  background: string;
  surface: string;
  card: string;
  panel: string;
  popover: string;
  border: string;
};

export type HarmonySurfaceDistribution = {
  background: string;
  surface: string;
  card: string;
  panel: string;
  popover: string;
};

function mix(primary: string, secondary: string, primaryPercent: number) {
  return `color-mix(in oklab, ${primary} ${primaryPercent}%, ${secondary})`;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function withAccentTint(surface: string, accentPercent: number) {
  const basePercent = clampPercent(100 - accentPercent);
  return mix(surface, "var(--accent-soft,var(--surface-3,var(--muted)))", basePercent);
}

type LocalHarmonySurface = "analogous" | "complementary" | "split-complementary";

type HarmonySurfaceProfile = {
  backgroundBlend: number;
  surfaceBlend: number;
  cardBlend: number;
  panelBlend: number;
  popoverBlend: number;
  panelBorderBlend: number;
  popoverBorderBlend: number;
  backgroundTint: number;
  surfaceTint: number;
  cardTint: number;
  panelTint: number;
  popoverTint: number;
};

const HARMONY_SURFACE_PROFILES: Record<LocalHarmonySurface, HarmonySurfaceProfile> = {
  // Low contrast hierarchy: compact and close surfaces.
  analogous: {
    backgroundBlend: 97,
    surfaceBlend: 91,
    cardBlend: 79,
    panelBlend: 72,
    popoverBlend: 67,
    panelBorderBlend: 96,
    popoverBorderBlend: 94,
    backgroundTint: 3,
    surfaceTint: 5,
    cardTint: 7,
    panelTint: 9,
    popoverTint: 11,
  },
  // High contrast hierarchy: strong step-up between each surface.
  complementary: {
    backgroundBlend: 95,
    surfaceBlend: 45,
    cardBlend: 24,
    panelBlend: 12,
    popoverBlend: 6,
    panelBorderBlend: 80,
    popoverBorderBlend: 74,
    backgroundTint: 8,
    surfaceTint: 14,
    cardTint: 22,
    panelTint: 30,
    popoverTint: 36,
  },
  // Medium contrast hierarchy: balanced separation.
  "split-complementary": {
    backgroundBlend: 96,
    surfaceBlend: 63,
    cardBlend: 44,
    panelBlend: 29,
    popoverBlend: 21,
    panelBorderBlend: 87,
    popoverBorderBlend: 83,
    backgroundTint: 6,
    surfaceTint: 10,
    cardTint: 15,
    panelTint: 21,
    popoverTint: 27,
  },
};
const ACCENT_STYLE_DEPTH_SHIFT: Record<BrandAccentStyle, number> = {
  minimal: 6,
  balanced: 0,
  expressive: -8,
};
const ACCENT_STYLE_TINT_SHIFT: Record<BrandAccentStyle, number> = {
  minimal: -5,
  balanced: 0,
  expressive: 6,
};

function toLocalHarmony(harmony: BrandHarmonyStrategy): LocalHarmonySurface {
  if (harmony === "analogous") return "analogous";
  if (harmony === "complementary") return "complementary";
  return "split-complementary";
}

export function mapHarmonyToSurfaces(
  palette: HarmonySurfacePalette,
  harmony: BrandHarmonyStrategy,
  accentStyle: BrandAccentStyle = "balanced"
): HarmonySurfaceDistribution {
  const profile = HARMONY_SURFACE_PROFILES[toLocalHarmony(harmony)];
  const depthShift = ACCENT_STYLE_DEPTH_SHIFT[accentStyle] ?? 0;
  const tintShift = ACCENT_STYLE_TINT_SHIFT[accentStyle] ?? 0;

  const backgroundBase = mix(palette.background, palette.surface, profile.backgroundBlend);
  const surfaceBase = mix(
    palette.background,
    palette.surface,
    clampPercent(profile.surfaceBlend + depthShift)
  );
  const cardBase = mix(
    palette.surface,
    palette.card,
    clampPercent(profile.cardBlend + depthShift * 0.92)
  );
  const panelBase = mix(
    mix(
      palette.surface,
      palette.panel,
      clampPercent(profile.panelBlend + depthShift * 0.82)
    ),
    palette.border,
    clampPercent(profile.panelBorderBlend + depthShift * 0.64)
  );
  const popoverBase = mix(
    mix(
      palette.surface,
      palette.popover,
      clampPercent(profile.popoverBlend + depthShift * 0.7)
    ),
    palette.border,
    clampPercent(profile.popoverBorderBlend + depthShift * 0.56)
  );

  return {
    background: withAccentTint(backgroundBase, clampPercent(profile.backgroundTint + tintShift * 0.45)),
    surface: withAccentTint(surfaceBase, clampPercent(profile.surfaceTint + tintShift * 0.65)),
    card: withAccentTint(cardBase, clampPercent(profile.cardTint + tintShift * 0.8)),
    panel: withAccentTint(panelBase, clampPercent(profile.panelTint + tintShift)),
    popover: withAccentTint(popoverBase, clampPercent(profile.popoverTint + tintShift * 1.1)),
  };
}
