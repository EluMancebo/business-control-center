import { getPageBlueprint } from "@/lib/site/helpers";
import type { BusinessSite } from "@/lib/site/types";
import type { ResolvedSitePage, SitePageReadResult } from "./types";

function normalizeRequestedPageKey(pageKey: string): string {
  return String(pageKey || "").trim().toLowerCase();
}

function createResolvedSitePage(
  site: BusinessSite,
  pageKey: string,
  blueprint: ResolvedSitePage["blueprint"]
): ResolvedSitePage {
  return {
    site,
    pageKey,
    blueprint,
  };
}

export function readSitePage(site: BusinessSite, pageKey: string): SitePageReadResult {
  const normalizedPageKey = normalizeRequestedPageKey(pageKey);
  if (!normalizedPageKey) return null;

  const blueprint = getPageBlueprint(site, normalizedPageKey);
  if (!blueprint) return null;

  return createResolvedSitePage(site, normalizedPageKey, blueprint);
}

export function hasSitePage(site: BusinessSite, pageKey: string): boolean {
  return readSitePage(site, pageKey) !== null;
}
