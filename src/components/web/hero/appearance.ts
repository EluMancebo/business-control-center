import type { HeroAppearanceVariant } from "@/lib/web/hero/types";

type HeroChromeSurfaceLevel = "none" | "subtle" | "present";

type HeroOverlayRecipe = {
  tintBackground: string;
  tintOpacity: string;
  noImageBackground: string;
};

type HeroChromeSurfaceRecipe = {
  chromeBackground: string;
  chromeHoverBackground: string;
  frameBackground: string;
  footerBackground: string;
};

type HeroAppearanceRecipe = {
  variant: HeroAppearanceVariant;
  overlay: HeroOverlayRecipe;
  chromeSurfaceLevel: HeroChromeSurfaceLevel;
};

type HeroAppearanceConfig = {
  variant: HeroAppearanceVariant;
  overlayTintBackground: string;
  overlayTintOpacity: string;
  overlayNoImageBackground: string;
  chromeBackground: string;
  chromeHoverBackground: string;
  frameBackground: string;
  footerBackground: string;
  chromeSurfaceLevel: HeroChromeSurfaceLevel;
};

const HERO_CHROME_SURFACE_CONFIG: Record<
  HeroChromeSurfaceLevel,
  HeroChromeSurfaceRecipe
> = {
  none: {
    chromeBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 8%,transparent)",
    chromeHoverBackground:
      "color-mix(in oklab,var(--accent,var(--primary)) 14%,transparent)",
    frameBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 4%,transparent)",
    footerBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 6%,transparent)",
  },
  subtle: {
    chromeBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 14%,transparent)",
    chromeHoverBackground:
      "color-mix(in oklab,var(--accent,var(--primary)) 22%,transparent)",
    frameBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 10%,transparent)",
    footerBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 12%,transparent)",
  },
  present: {
    chromeBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 44%,black)",
    chromeHoverBackground:
      "color-mix(in oklab,var(--accent,var(--primary)) 56%,black)",
    frameBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 40%,black)",
    footerBackground:
      "color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 42%,black)",
  },
};

const HERO_APPEARANCE_RECIPES: Record<HeroAppearanceVariant, HeroAppearanceRecipe> = {
  transparent: {
    variant: "transparent",
    overlay: {
      tintBackground:
        "linear-gradient(140deg,color-mix(in oklab,var(--accent,var(--primary)) 42%,transparent),color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 34%,transparent) 54%,color-mix(in oklab,var(--accent,var(--primary)) 38%,transparent))",
      tintOpacity: "0.14",
      noImageBackground:
        "linear-gradient(to bottom,color-mix(in oklab,var(--accent,var(--primary)) 52%,transparent),color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 46%,transparent),color-mix(in oklab,var(--accent,var(--primary)) 50%,transparent))",
    },
    chromeSurfaceLevel: "none",
  },
  soft: {
    variant: "soft",
    overlay: {
      tintBackground:
        "linear-gradient(140deg,color-mix(in oklab,var(--accent,var(--primary)) 68%,transparent),color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 60%,transparent) 54%,color-mix(in oklab,var(--accent,var(--primary)) 66%,transparent))",
      tintOpacity: "0.34",
      noImageBackground:
        "linear-gradient(to bottom,color-mix(in oklab,var(--accent,var(--primary)) 60%,black),color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 54%,black),color-mix(in oklab,var(--accent,var(--primary)) 62%,black))",
    },
    chromeSurfaceLevel: "subtle",
  },
  solid: {
    variant: "solid",
    overlay: {
      tintBackground:
        "linear-gradient(140deg,color-mix(in oklab,var(--accent,var(--primary)) 72%,black),color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 64%,black) 54%,color-mix(in oklab,var(--accent,var(--primary)) 70%,black))",
      tintOpacity: "0.58",
      noImageBackground:
        "linear-gradient(to bottom,color-mix(in oklab,var(--accent,var(--primary)) 74%,black),color-mix(in oklab,var(--accent-soft,var(--surface-3,var(--muted))) 68%,black),color-mix(in oklab,var(--accent,var(--primary)) 76%,black))",
    },
    chromeSurfaceLevel: "present",
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
  const recipe = HERO_APPEARANCE_RECIPES[variant];
  const chrome = HERO_CHROME_SURFACE_CONFIG[recipe.chromeSurfaceLevel];

  return {
    variant: recipe.variant,
    overlayTintBackground: recipe.overlay.tintBackground,
    overlayTintOpacity: recipe.overlay.tintOpacity,
    overlayNoImageBackground: recipe.overlay.noImageBackground,
    chromeBackground: chrome.chromeBackground,
    chromeHoverBackground: chrome.chromeHoverBackground,
    frameBackground: chrome.frameBackground,
    footerBackground: chrome.footerBackground,
    chromeSurfaceLevel: recipe.chromeSurfaceLevel,
  };
}
