import type { Brand } from "@/lib/brand/types";
import {
  createHomeBlueprintFromPublishedHero,
  type PageBlueprint,
  type PublishedHeroSnapshot,
} from "@/lib/studio";
import type { BusinessSite, BusinessSiteLookup, SitePages } from "./types";

const DEFAULT_SITE_BRAND: Brand = {
  brandName: "Business Control Center",
  palette: "bcc",
  mode: "system",
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeSiteSlug(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeSiteDomain(value: string): string {
  const normalized = normalizeText(value)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

  return normalized;
}

export function normalizeSiteLookup(lookup: BusinessSiteLookup): BusinessSiteLookup {
  const slug = typeof lookup.slug === "string" ? normalizeSiteSlug(lookup.slug) : "";
  const domain = typeof lookup.domain === "string" ? normalizeSiteDomain(lookup.domain) : "";

  return {
    slug: slug || undefined,
    domain: domain || undefined,
  };
}

function mergeBrandConfig(brandConfig?: Partial<Brand>): Brand {
  if (!brandConfig) return { ...DEFAULT_SITE_BRAND };

  return {
    brandName:
      typeof brandConfig.brandName === "string" && brandConfig.brandName.trim()
        ? brandConfig.brandName.trim()
        : DEFAULT_SITE_BRAND.brandName,
    palette: brandConfig.palette ?? DEFAULT_SITE_BRAND.palette,
    mode: brandConfig.mode ?? DEFAULT_SITE_BRAND.mode,
  };
}

function normalizePageKey(value: string): string {
  return normalizeText(value);
}

function normalizeSitePages(pages?: SitePages): SitePages {
  const normalizedPages: SitePages = {};
  if (!pages) return normalizedPages;

  for (const [pageKey, blueprint] of Object.entries(pages)) {
    const normalizedKey = normalizePageKey(pageKey);
    if (!normalizedKey) continue;
    normalizedPages[normalizedKey] = blueprint;
  }

  return normalizedPages;
}

export function getPageBlueprint(site: BusinessSite, pageKey: string): PageBlueprint | null {
  const key = normalizePageKey(pageKey);
  if (!key) return null;
  return site.pages[key] ?? null;
}

export type BuildBusinessSiteInput = {
  businessId: string;
  domain?: string;
  slug: string;
  brandConfig?: Partial<Brand>;
  pages?: SitePages;
  homeHero?: PublishedHeroSnapshot;
};

export function buildBusinessSite(input: BuildBusinessSiteInput): BusinessSite {
  const businessId = String(input.businessId || "").trim();
  if (!businessId) {
    throw new Error("buildBusinessSite: businessId is required");
  }

  const slug = normalizeSiteSlug(input.slug);
  if (!slug) {
    throw new Error("buildBusinessSite: slug is required");
  }

  const domain = typeof input.domain === "string" ? normalizeSiteDomain(input.domain) : "";
  const pages: SitePages = normalizeSitePages(input.pages);

  if (!pages.home && input.homeHero) {
    pages.home = createHomeBlueprintFromPublishedHero(input.homeHero);
  }

  return {
    businessId,
    domain: domain || undefined,
    slug,
    brandConfig: mergeBrandConfig(input.brandConfig),
    pages,
  };
}
