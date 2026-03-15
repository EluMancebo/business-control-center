import { getSectionDefinition } from "@/lib/taller/sections/registry";
import type { HeroData } from "@/lib/web/hero/types";
import type { SectionInstance } from "./types";

export type HeroSectionPayload = HeroData;

function normalizeVariant(value: string): string {
  const normalized = value.trim().toLowerCase();
  return normalized || "default";
}

export function createHeroSectionInstance(args: {
  variantKey: string;
  payload: HeroData;
}): SectionInstance<HeroSectionPayload> {
  const definition = getSectionDefinition("hero");
  if (!definition) {
    throw new Error('Section "hero" is not registered in sectionsRegistry');
  }

  return {
    id: definition.id,
    variant: normalizeVariant(args.variantKey),
    payload: args.payload,
  };
}
