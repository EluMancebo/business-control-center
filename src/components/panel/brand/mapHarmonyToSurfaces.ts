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
    profile.panelBorderBlend
  );
  const popoverBase = mix(
    mix(palette.surface, palette.popover, profile.popoverBlend),
    palette.border,
    profile.popoverBorderBlend
  );

  return {
    background: withAccentTint(backgroundBase, profile.backgroundTint),
    surface: withAccentTint(surfaceBase, profile.surfaceTint),
    card: withAccentTint(cardBase, profile.cardTint),
    panel: withAccentTint(panelBase, profile.panelTint),
    popover: withAccentTint(popoverBase, profile.popoverTint),
  };
}
