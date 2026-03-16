import type { PageBlueprint } from "@/lib/studio";
import type { ResolvedSitePage, SitePageSections, SitePageSectionsInput } from "./types";

function isResolvedSitePage(value: SitePageSectionsInput): value is ResolvedSitePage {
  return Boolean(value && typeof value === "object" && "blueprint" in value);
}

function resolveBlueprint(input: SitePageSectionsInput): PageBlueprint | null {
  if (!input) return null;
  return isResolvedSitePage(input) ? input.blueprint : input;
}

export function getSitePageSections(input: SitePageSectionsInput): SitePageSections {
  const blueprint = resolveBlueprint(input);
  if (!blueprint) return [];
  return blueprint.sections.slice();
}
