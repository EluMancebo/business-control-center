import type { PublishedPieceSnapshot } from "@/lib/content-lab/published/types";
import { DEFAULT_HERO, type HeroData } from "@/lib/web/hero/types";

export function mapPublishedSnapshotToContentPayload(
  snapshot: PublishedPieceSnapshot
): HeroData {
  if (snapshot.pieceType !== "hero" && snapshot.pieceType !== "banner") {
    throw new Error("Published snapshot pieceType must be hero or banner.");
  }
  if (snapshot.pieceType === "banner") {
    throw new Error("Banner snapshot cannot be mapped: runtime banner payload type is not defined.");
  }

  return {
    ...DEFAULT_HERO,
    badge:
      typeof snapshot.payload.badgeText === "string"
        ? snapshot.payload.badgeText
        : DEFAULT_HERO.badge,
    title:
      typeof snapshot.payload.headline === "string"
        ? snapshot.payload.headline
        : DEFAULT_HERO.title,
    description:
      typeof snapshot.payload.subheadline === "string"
        ? snapshot.payload.subheadline
        : DEFAULT_HERO.description,
    primaryCtaLabel:
      typeof snapshot.payload.primaryCta?.label === "string"
        ? snapshot.payload.primaryCta.label
        : DEFAULT_HERO.primaryCtaLabel,
    primaryCtaHref:
      typeof snapshot.payload.primaryCta?.href === "string"
        ? snapshot.payload.primaryCta.href
        : DEFAULT_HERO.primaryCtaHref,
    secondaryCtaLabel:
      typeof snapshot.payload.secondaryCta?.label === "string"
        ? snapshot.payload.secondaryCta.label
        : DEFAULT_HERO.secondaryCtaLabel,
    secondaryCtaHref:
      typeof snapshot.payload.secondaryCta?.href === "string"
        ? snapshot.payload.secondaryCta.href
        : DEFAULT_HERO.secondaryCtaHref,
    backgroundImageUrl:
      typeof snapshot.payload.media?.url === "string"
        ? snapshot.payload.media.url
        : DEFAULT_HERO.backgroundImageUrl,
  };
}
