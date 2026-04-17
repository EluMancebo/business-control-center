import type { HeroAppearanceVariant } from "@/lib/web/hero/types";
import { DEFAULT_HERO } from "@/lib/web/hero/types";

export type PublicHeroPayload = {
  badge: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  logoSvg?: string;
  heroAppearanceVariant?: HeroAppearanceVariant;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asOptionalString(value: unknown): string | undefined {
  const normalized = asNonEmptyString(value);
  return normalized ?? undefined;
}

function asHeroAppearanceVariant(value: unknown): HeroAppearanceVariant | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "transparent") return "transparent";
  if (normalized === "soft") return "soft";
  if (normalized === "solid") return "solid";
  return undefined;
}

export function mapHeroToPublicPayload(input: unknown): PublicHeroPayload {
  if (!isRecord(input)) {
    return { ...DEFAULT_HERO };
  }

  return {
    badge: asNonEmptyString(input.badge) ?? DEFAULT_HERO.badge,
    title: asNonEmptyString(input.title) ?? DEFAULT_HERO.title,
    description: asNonEmptyString(input.description) ?? DEFAULT_HERO.description,
    primaryCtaLabel:
      asNonEmptyString(input.primaryCtaLabel) ?? DEFAULT_HERO.primaryCtaLabel,
    primaryCtaHref: asNonEmptyString(input.primaryCtaHref) ?? DEFAULT_HERO.primaryCtaHref,
    secondaryCtaLabel:
      asNonEmptyString(input.secondaryCtaLabel) ?? DEFAULT_HERO.secondaryCtaLabel,
    secondaryCtaHref:
      asNonEmptyString(input.secondaryCtaHref) ?? DEFAULT_HERO.secondaryCtaHref,
    backgroundImageUrl: asOptionalString(input.backgroundImageUrl),
    logoUrl: asOptionalString(input.logoUrl),
    logoSvg: asOptionalString(input.logoSvg),
    heroAppearanceVariant: asHeroAppearanceVariant(input.heroAppearanceVariant),
  };
}
