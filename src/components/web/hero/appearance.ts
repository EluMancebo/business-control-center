import type { HeroAppearanceVariant } from "@/lib/web/hero/types";

type HeroAppearanceConfig = {
  variant: HeroAppearanceVariant;
  overlayImageBackground: string;
  overlayImageOpacity: string;
  overlayGradientBackground: string;
  chromeBackground: string;
  chromeHoverBackground: string;
  frameBackground: string;
  footerBackground: string;
};

const HERO_APPEARANCE_CONFIG: Record<HeroAppearanceVariant, HeroAppearanceConfig> = {
  transparent: {
    variant: "transparent",
    overlayImageBackground:
      "color-mix(in_oklab,var(--accent,var(--primary))_12%,black)",
    overlayImageOpacity: "0.36",
    overlayGradientBackground:
      "linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_42%,transparent),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_48%,transparent),color-mix(in_oklab,var(--accent,var(--primary))_40%,transparent))",
    chromeBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_18%,transparent)",
    chromeHoverBackground:
      "color-mix(in_oklab,var(--accent,var(--primary))_28%,transparent)",
    frameBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_16%,transparent)",
    footerBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_16%,transparent)",
  },
  soft: {
    variant: "soft",
    overlayImageBackground:
      "color-mix(in_oklab,var(--accent,var(--primary))_22%,black)",
    overlayImageOpacity: "0.52",
    overlayGradientBackground:
      "linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_28%,black),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_34%,black),color-mix(in_oklab,var(--accent,var(--primary))_30%,black))",
    chromeBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_30%,black)",
    chromeHoverBackground:
      "color-mix(in_oklab,var(--accent,var(--primary))_38%,black)",
    frameBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_26%,black)",
    footerBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_28%,black)",
  },
  solid: {
    variant: "solid",
    overlayImageBackground:
      "color-mix(in_oklab,var(--accent,var(--primary))_42%,black)",
    overlayImageOpacity: "0.82",
    overlayGradientBackground:
      "linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_48%,black),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_58%,black),color-mix(in_oklab,var(--accent,var(--primary))_52%,black))",
    chromeBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_56%,black)",
    chromeHoverBackground:
      "color-mix(in_oklab,var(--accent,var(--primary))_66%,black)",
    frameBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_50%,black)",
    footerBackground:
      "color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_52%,black)",
  },
};

const DEFAULT_HERO_APPEARANCE_VARIANT: HeroAppearanceVariant = "soft";

function asVariant(input: unknown): HeroAppearanceVariant | null {
  if (typeof input !== "string") return null;
  const normalized = input.trim().toLowerCase();
  if (normalized === "transparent") return "transparent";
  if (normalized === "soft") return "soft";
  if (normalized === "solid") return "solid";
  return null;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

function readAppearanceVariantFromData(input: unknown): HeroAppearanceVariant | null {
  if (!isRecord(input)) return null;

  const direct =
    asVariant(input.heroAppearanceVariant) ??
    asVariant(input.heroAppearance) ??
    asVariant(input.appearanceVariant);
  if (direct) return direct;

  if (isRecord(input.appearance)) {
    const nested =
      asVariant(input.appearance.variant) ?? asVariant(input.appearance.style);
    if (nested) return nested;
  }

  return null;
}

export function resolveHeroAppearance(input: unknown): HeroAppearanceConfig {
  const variant =
    readAppearanceVariantFromData(input) ?? DEFAULT_HERO_APPEARANCE_VARIANT;
  return HERO_APPEARANCE_CONFIG[variant];
}
