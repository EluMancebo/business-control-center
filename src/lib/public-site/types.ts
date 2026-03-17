import type { BusinessSiteRepository } from "@/lib/site/resolver";
import type { BusinessSite } from "@/lib/site/types";
import type { ResolvedSitePage } from "@/lib/site-reader";
import type { SiteRenderNotFound, SiteRenderSuccess } from "@/lib/site-renderer";

export type PublicSiteLookup = {
  domain?: string;
  slug?: string;
};

export type PublicSitePageLookup = PublicSiteLookup & {
  pageKey: string;
};

export type PublicSiteRepository = BusinessSiteRepository;

export type PublicSiteResolved = {
  ok: true;
  lookup: PublicSiteLookup;
  site: BusinessSite;
};

export type PublicSiteNotFound = {
  ok: false;
  reason: "site_not_found";
  lookup: PublicSiteLookup;
  site: null;
};

export type PublicSiteResult = PublicSiteResolved | PublicSiteNotFound;

export type PublicSitePageResolved = {
  ok: true;
  lookup: PublicSitePageLookup;
  site: BusinessSite;
  page: ResolvedSitePage;
  render: SiteRenderSuccess;
};

export type PublicSitePageSiteNotFound = {
  ok: false;
  reason: "site_not_found";
  lookup: PublicSitePageLookup;
  site: null;
  page: null;
  render: null;
};

export type PublicSitePageNotFound = {
  ok: false;
  reason: "page_not_found";
  lookup: PublicSitePageLookup;
  site: BusinessSite;
  page: null;
  render: SiteRenderNotFound;
};

export type PublicSitePageResult =
  | PublicSitePageResolved
  | PublicSitePageSiteNotFound
  | PublicSitePageNotFound;
