import type { BusinessSite } from "@/lib/site/types";
import type { PageBlueprint, SectionInstance } from "@/lib/studio";

export type ResolvedSitePage = {
  site: BusinessSite;
  pageKey: string;
  blueprint: PageBlueprint;
};

export type SitePageReadResult = ResolvedSitePage | null;

export type SitePageSections = SectionInstance[];

export type SitePageSectionsInput = ResolvedSitePage | PageBlueprint | null | undefined;
