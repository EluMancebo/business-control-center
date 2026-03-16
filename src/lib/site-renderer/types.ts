import type { ResolvedSitePage } from "@/lib/site-reader";
import type { HeroSectionPayload } from "@/lib/studio";

export type RenderableHeroSection = {
  type: "hero";
  sectionId: "hero";
  variant: string;
  payload: HeroSectionPayload;
};

export type RenderableUnsupportedSection = {
  type: "unsupported";
  sectionId: string;
  variant?: string;
  reason: "unknown_section" | "invalid_payload";
};

export type RenderableSection = RenderableHeroSection | RenderableUnsupportedSection;

export type RendererInputSection = {
  id: string;
  variant?: string;
  payload?: unknown;
};

export type SiteRenderSuccess = {
  ok: true;
  page: ResolvedSitePage;
  sections: RenderableSection[];
};

export type SiteRenderNotFound = {
  ok: false;
  reason: "page_not_found";
  pageKey: string;
  sections: [];
};

export type SiteRenderResult = SiteRenderSuccess | SiteRenderNotFound;
