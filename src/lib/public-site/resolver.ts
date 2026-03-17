import { normalizeSiteLookup } from "@/lib/site/helpers";
import { resolveBusinessSite } from "@/lib/site/resolver";
import type { PublicSiteLookup, PublicSiteRepository, PublicSiteResult } from "./types";

export async function resolvePublicSite(
  lookup: PublicSiteLookup,
  repository: PublicSiteRepository
): Promise<PublicSiteResult> {
  const normalizedLookup = normalizeSiteLookup(lookup);
  const site = await resolveBusinessSite(normalizedLookup, repository);

  if (!site) {
    return {
      ok: false,
      reason: "site_not_found",
      lookup: normalizedLookup,
      site: null,
    };
  }

  return {
    ok: true,
    lookup: normalizedLookup,
    site,
  };
}
