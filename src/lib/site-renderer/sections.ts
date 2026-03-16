import { getSitePageSections, type SitePageSectionsInput } from "@/lib/site-reader";
import type { SectionInstance } from "@/lib/studio";
import { renderHeroSection } from "./hero";
import type { RenderableSection, RenderableUnsupportedSection, RendererInputSection } from "./types";

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeSectionId(value: unknown): string {
  if (typeof value !== "string") return "";
  return normalizeText(value);
}

function normalizeVariant(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = normalizeText(value);
  return normalized || undefined;
}

function toRendererInputSection(section: SectionInstance): RendererInputSection {
  return {
    id: normalizeSectionId(section.id),
    variant: normalizeVariant(section.variant),
    payload: section.payload,
  };
}

function createUnsupportedSection(section: RendererInputSection): RenderableUnsupportedSection {
  return {
    type: "unsupported",
    sectionId: section.id || "unknown",
    variant: section.variant,
    reason: "unknown_section",
  };
}

export function renderSiteSections(input: SitePageSectionsInput): RenderableSection[] {
  const sections = getSitePageSections(input);
  const renderable: RenderableSection[] = [];

  for (const section of sections) {
    const normalizedSection = toRendererInputSection(section);

    if (normalizedSection.id === "hero") {
      renderable.push(renderHeroSection(normalizedSection));
      continue;
    }

    renderable.push(createUnsupportedSection(normalizedSection));
  }

  return renderable;
}
