import { HeroPreset } from "@/models/HeroPreset";
import type {
  HeroPresetCreateInput,
  HeroPresetListQuery,
  HeroPresetUpdateInput,
} from "./types";

export async function listHeroPresetsRepository(query: HeroPresetListQuery) {
  const mongoQuery: { status: "active" | "archived"; tags?: string } = {
    status: query.status,
  };
  if (query.tag) mongoQuery.tags = query.tag;

  return HeroPreset.find(mongoQuery).sort({ createdAt: -1 }).limit(200).lean();
}

export async function getHeroPresetByIdRepository(id: string) {
  return HeroPreset.findById(id).lean();
}

export async function createHeroPresetRepository(input: HeroPresetCreateInput) {
  return HeroPreset.create(input);
}

export async function updateHeroPresetByIdRepository(id: string, update: HeroPresetUpdateInput) {
  return HeroPreset.findByIdAndUpdate(id, update, { new: true }).lean();
}

export async function archiveHeroPresetByIdRepository(id: string) {
  return HeroPreset.findByIdAndUpdate(id, { status: "archived" }, { new: true }).lean();
}
