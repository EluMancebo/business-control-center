import type { Brand } from "@/lib/brand/types";
import type { PageBlueprint } from "@/lib/studio";

export type SitePages = Record<string, PageBlueprint>;

export type BusinessSite = {
  businessId: string;
  domain?: string;
  slug: string;
  brandConfig: Brand;
  pages: SitePages;
};

export type BusinessSiteLookup = {
  domain?: string;
  slug?: string;
};
