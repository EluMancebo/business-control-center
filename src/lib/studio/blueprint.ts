import type { HeroData } from "@/lib/web/hero/types";
import { createHeroSectionInstance } from "./hero";
import type { PageBlueprint, SectionInstance } from "./types";

export type PublishedHeroSnapshot = {
  variantKey: string;
  data: HeroData;
};

export function createHomeBlueprintFromPublishedHero(hero: PublishedHeroSnapshot): PageBlueprint {
  return {
    page: "home",
    sections: [
      createHeroSectionInstance({
        variantKey: hero.variantKey,
        payload: hero.data,
      }),
    ],
  };
}

export function getSectionInstance(
  blueprint: PageBlueprint,
  sectionId: SectionInstance["id"]
): SectionInstance | undefined {
  return blueprint.sections.find((section) => section.id === sectionId);
}

export function getHeroPayloadFromBlueprint(blueprint: PageBlueprint): HeroData | null {
  const heroSection = getSectionInstance(blueprint, "hero");
  if (!heroSection?.payload || typeof heroSection.payload !== "object") return null;
  return heroSection.payload as HeroData;
}
