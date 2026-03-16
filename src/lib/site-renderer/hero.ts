import type { HeroSectionPayload } from "@/lib/studio";
import type { RenderableHeroSection, RenderableUnsupportedSection, RendererInputSection } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function getOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  return normalized || undefined;
}

function normalizeVariant(variant: string | undefined): string {
  if (!variant) return "default";
  const normalized = variant.trim().toLowerCase();
  return normalized || "default";
}

export function parseHeroSectionPayload(payload: unknown): HeroSectionPayload | null {
  if (!isRecord(payload)) return null;

  const badge = getRequiredString(payload, "badge");
  const title = getRequiredString(payload, "title");
  const description = getRequiredString(payload, "description");
  const primaryCtaLabel = getRequiredString(payload, "primaryCtaLabel");
  const primaryCtaHref = getRequiredString(payload, "primaryCtaHref");
  const secondaryCtaLabel = getRequiredString(payload, "secondaryCtaLabel");
  const secondaryCtaHref = getRequiredString(payload, "secondaryCtaHref");

  if (
    !badge ||
    !title ||
    !description ||
    !primaryCtaLabel ||
    !primaryCtaHref ||
    !secondaryCtaLabel ||
    !secondaryCtaHref
  ) {
    return null;
  }

  return {
    badge,
    title,
    description,
    primaryCtaLabel,
    primaryCtaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    backgroundImageUrl: getOptionalString(payload, "backgroundImageUrl"),
    logoUrl: getOptionalString(payload, "logoUrl"),
    logoSvg: getOptionalString(payload, "logoSvg"),
  };
}

export function renderHeroSection(
  section: RendererInputSection
): RenderableHeroSection | RenderableUnsupportedSection {
  const payload = parseHeroSectionPayload(section.payload);
  const variant = normalizeVariant(section.variant);

  if (!payload) {
    return {
      type: "unsupported",
      sectionId: "hero",
      variant,
      reason: "invalid_payload",
    };
  }

  return {
    type: "hero",
    sectionId: "hero",
    variant,
    payload,
  };
}
