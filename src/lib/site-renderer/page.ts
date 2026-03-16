import { readSitePage } from "@/lib/site-reader";
import type { BusinessSite } from "@/lib/site/types";
import { renderSiteSections } from "./sections";
import type { SiteRenderResult } from "./types";

function normalizePageKey(pageKey: string): string {
  return String(pageKey || "").trim().toLowerCase();
}

export function renderSitePage(site: BusinessSite, pageKey: string): SiteRenderResult {
  const resolvedPage = readSitePage(site, pageKey);
  if (!resolvedPage) {
    return {
      ok: false,
      reason: "page_not_found",
      pageKey: normalizePageKey(pageKey),
      sections: [],
    };
  }

  return {
    ok: true,
    page: resolvedPage,
    sections: renderSiteSections(resolvedPage),
  };
}
