import type { BrandHarmonyStrategy } from "@/lib/brand-theme";

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

function withAccentTint(surface: string, accentPercent: number) {
  const basePercent = Math.max(0, Math.min(100, 100 - accentPercent));
  return mix(surface, "var(--accent-soft,var(--surface-3,var(--muted)))", basePercent);
}

type LocalHarmonySurface = "analogous" | "complementary" | "split-complementary";

type HarmonySurfaceProfile = {
  backgroundBlend: number;
  surfaceBlend: number;
  cardBlend: number;
  panelBlend: number;
  popoverBlend: number;
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
    surfaceBlend: 89,
    cardBlend: 75,
    panelBlend: 68,
    popoverBlend: 62,
    backgroundTint: 4,
    surfaceTint: 6,
    cardTint: 8,
    panelTint: 10,
    popoverTint: 12,
  },
  // High contrast hierarchy: strong step-up between each surface.
  complementary: {
    backgroundBlend: 97,
    surfaceBlend: 54,
    cardBlend: 36,
    panelBlend: 26,
    popoverBlend: 18,
    backgroundTint: 6,
    surfaceTint: 10,
    cardTint: 16,
    panelTint: 22,
    popoverTint: 28,
  },
  // Medium contrast hierarchy: balanced separation.
  "split-complementary": {
    backgroundBlend: 96,
    surfaceBlend: 70,
    cardBlend: 52,
    panelBlend: 42,
    popoverBlend: 34,
    backgroundTint: 5,
    surfaceTint: 8,
    cardTint: 12,
    panelTint: 16,
    popoverTint: 20,
  },
};

function toLocalHarmony(harmony: BrandHarmonyStrategy): LocalHarmonySurface {
  if (harmony === "analogous") return "analogous";
  if (harmony === "complementary") return "complementary";
  return "split-complementary";
}

export function mapHarmonyToSurfaces(
  palette: HarmonySurfacePalette,
  harmony: BrandHarmonyStrategy
): HarmonySurfaceDistribution {
  const profile = HARMONY_SURFACE_PROFILES[toLocalHarmony(harmony)];

  const backgroundBase = mix(palette.background, palette.surface, profile.backgroundBlend);
  const surfaceBase = mix(palette.background, palette.surface, profile.surfaceBlend);
  const cardBase = mix(palette.surface, palette.card, profile.cardBlend);
  const panelBase = mix(
    mix(palette.surface, palette.panel, profile.panelBlend),
    palette.border,
    94
  );
  const popoverBase = mix(
    mix(palette.surface, palette.popover, profile.popoverBlend),
    palette.border,
    92
  );

  return {
    background: withAccentTint(backgroundBase, profile.backgroundTint),
    surface: withAccentTint(surfaceBase, profile.surfaceTint),
    card: withAccentTint(cardBase, profile.cardTint),
    panel: withAccentTint(panelBase, profile.panelTint),
    popover: withAccentTint(popoverBase, profile.popoverTint),
  };
}
