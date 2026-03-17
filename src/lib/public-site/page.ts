import { normalizeSiteLookup } from "@/lib/site/helpers";
import { readSitePage } from "@/lib/site-reader";
import { renderSitePage } from "@/lib/site-renderer";
import { resolvePublicSite } from "./resolver";
import type { PublicSitePageLookup, PublicSitePageResult, PublicSiteRepository } from "./types";

function normalizePageKey(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function normalizePublicSitePageLookup(lookup: PublicSitePageLookup): PublicSitePageLookup {
  const normalizedLookup = normalizeSiteLookup(lookup);

  return {
    ...normalizedLookup,
    pageKey: normalizePageKey(lookup.pageKey),
  };
}

export async function resolvePublicSitePage(
  lookup: PublicSitePageLookup,
  repository: PublicSiteRepository
): Promise<PublicSitePageResult> {
  const normalizedLookup = normalizePublicSitePageLookup(lookup);
  const resolvedSite = await resolvePublicSite(normalizedLookup, repository);

  if (!resolvedSite.ok) {
    return {
      ok: false,
      reason: "site_not_found",
      lookup: normalizedLookup,
      site: null,
      page: null,
      render: null,
    };
  }

  const page = readSitePage(resolvedSite.site, normalizedLookup.pageKey);
  if (!page) {
    const render = renderSitePage(resolvedSite.site, normalizedLookup.pageKey);

    return {
      ok: false,
      reason: "page_not_found",
      lookup: normalizedLookup,
      site: resolvedSite.site,
      page: null,
      render: render.ok
        ? {
            ok: false,
            reason: "page_not_found",
            pageKey: normalizedLookup.pageKey,
            sections: [],
          }
        : render,
    };
  }

  const render = renderSitePage(resolvedSite.site, normalizedLookup.pageKey);
  if (!render.ok) {
    return {
      ok: false,
      reason: "page_not_found",
      lookup: normalizedLookup,
      site: resolvedSite.site,
      page: null,
      render,
    };
  }

  return {
    ok: true,
    lookup: normalizedLookup,
    site: resolvedSite.site,
    page,
    render,
  };
}
