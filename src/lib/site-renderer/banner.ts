import {
  mapBannerToPublicPayload,
  type PublicBannerPayload,
} from "@/lib/web/banner/publicPayload";
import type {
  RenderableBannerSection,
  RenderableUnsupportedSection,
  RendererInputSection,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeVariant(variant: string | undefined): string {
  if (!variant) return "default";
  const normalized = variant.trim().toLowerCase();
  return normalized || "default";
}

function hasRenderableBannerFields(payload: Record<string, unknown>): boolean {
  const directKeys = [
    "title",
    "headline",
    "description",
    "subheadline",
    "ctaLabel",
    "ctaHref",
    "primaryCtaLabel",
    "primaryCtaHref",
    "backgroundImageUrl",
    "visualVariant",
    "overlay",
  ];

  if (directKeys.some((key) => typeof payload[key] === "string" && payload[key].trim() !== "")) {
    return true;
  }

  const primaryCta = payload.primaryCta;
  if (
    isRecord(primaryCta) &&
    (typeof primaryCta.label === "string" || typeof primaryCta.href === "string")
  ) {
    return true;
  }

  const media = payload.media;
  if (isRecord(media) && typeof media.url === "string" && media.url.trim() !== "") {
    return true;
  }

  return false;
}

export function parseBannerSectionPayload(payload: unknown): PublicBannerPayload | null {
  if (!isRecord(payload)) return null;
  if (!hasRenderableBannerFields(payload)) return null;
  return mapBannerToPublicPayload(payload);
}

export function renderBannerSection(
  section: RendererInputSection
): RenderableBannerSection | RenderableUnsupportedSection {
  const payload = parseBannerSectionPayload(section.payload);
  const variant = normalizeVariant(section.variant);

  if (!payload) {
    return {
      type: "unsupported",
      sectionId: "banner",
      variant,
      reason: "invalid_payload",
    };
  }

  return {
    type: "banner",
    sectionId: "banner",
    variant,
    payload,
  };
}
