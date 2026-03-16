import { normalizeSiteDomain, normalizeSiteLookup, normalizeSiteSlug } from "./helpers";
import type { BusinessSite, BusinessSiteLookup } from "./types";

export type BusinessSiteRepository = {
  findByDomain(domain: string): Promise<BusinessSite | null>;
  findBySlug(slug: string): Promise<BusinessSite | null>;
};

export async function resolveBusinessSite(
  lookup: BusinessSiteLookup,
  repository: BusinessSiteRepository
): Promise<BusinessSite | null> {
  const normalized = normalizeSiteLookup(lookup);

  if (normalized.domain) {
    const siteByDomain = await repository.findByDomain(normalized.domain);
    if (siteByDomain) return siteByDomain;
  }

  if (normalized.slug) {
    const siteBySlug = await repository.findBySlug(normalized.slug);
    if (siteBySlug) return siteBySlug;
  }

  return null;
}

export function resolveBusinessSiteFromCollection(
  lookup: BusinessSiteLookup,
  sites: BusinessSite[]
): BusinessSite | null {
  const normalized = normalizeSiteLookup(lookup);

  if (normalized.domain) {
    const siteByDomain =
      sites.find((site) => normalizeSiteDomain(site.domain ?? "") === normalized.domain) ?? null;
    if (siteByDomain) return siteByDomain;
  }

  if (normalized.slug) {
    return sites.find((site) => normalizeSiteSlug(site.slug) === normalized.slug) ?? null;
  }

  return null;
}
